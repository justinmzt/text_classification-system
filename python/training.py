import sys
import time
import os
import numpy as np
from pymongo import MongoClient  # 连接mongoDB，读取配置
from bson.objectid import ObjectId

# models
from sklearn.naive_bayes import MultinomialNB as MNB
from sklearn.svm import LinearSVC

# score
from sklearn.metrics import accuracy_score
from sklearn.metrics import precision_score
from sklearn.metrics import recall_score
from sklearn.metrics import f1_score

from text_classification import TextClassification
from classifier import Classifier

class Timer():
    def __init__(self):
        self.start = time.time()

    def getTime(self):
        return time.time() - self.start

root = os.path.dirname(os.path.abspath(__file__))

def getAbsPath(path):
    if path[0] == '.':
        return os.path.join(root, os.path.relpath(path))
    return path

# models
model_path = os.path.join(root, "models")
if not os.path.exists(model_path):
    os.makedirs(model_path)

client = MongoClient()
db = client.mao

datasets_id = sys.argv[1]

datasets = db.datasets.find_one({"_id": ObjectId(datasets_id)})

quest = TextClassification(train_filename=getAbsPath(datasets["train_file"]),
                           test_filename=getAbsPath(datasets["test_file"]),
                           categories=datasets["categories"])

print(datasets["categories"])
x_train, y_train = quest.readFileAndCut(quest.train_filename)
x_test, y_test = quest.readFileAndCut(quest.test_filename)

train_tfidf, test_tfidf = quest.train_tf(x_train, x_test)

def execClassify(name, model):
    classifier = Classifier(name, model)
    classifier.fit(train_tfidf, y_train)
    # classifier.test(y_test, test_tfidf)

db.datasets.update_one({"_id": ObjectId(datasets_id)}, {"$set": {"status": 2}})

def createClassifier(type, model_data):
    if type == "MNB":
        return Classifier(name='多项式朴素贝叶斯分类器', model=MNB(
                    alpha=model_data["alpha"], fit_prior=model_data["fit_prior"]))
    elif type == "LinearSVC":
        return Classifier(name='线性核SVM分类器', model=LinearSVC(
            tol=model_data["tol"], C=model_data["C"], penalty=model_data["penalty"], loss=model_data["loss"]))
    else:
        return False
modelMap = {
    "MNB": "models",
    "LinearSVC": "svc_models"
}
while 1:
    train_data = db.trains.find_one_and_update({"status": 0}, {"$set": {"status": 1}})
    print(train_data)
    if train_data:
        model_data = db[modelMap[train_data["type"]]].find_one({"_id": train_data["model_id"]})
        print("mdata", model_data)
        if model_data:
            timer = Timer()
            classifier = createClassifier(train_data["type"], model_data)
            if not classifier:
                print("not classifier")
                db.trains.update_one({"_id": train_data["_id"]}, {"$set": {
                    "status": 2,
                }})
                continue
            print("model gen ok")
            classifier.fit(train_tfidf, y_train)
            train_consuming = timer.getTime()
            # 保存训练好的模型
            np.save(os.path.join(model_path, str(model_data["_id"])), classifier.model)
            timer = Timer()
            y_pred = classifier.predict(test_tfidf)
            test_consuming = timer.getTime()
            db.trains.update_one({"_id": train_data["_id"]}, {"$set": {
                "status": 2,
                "train_consuming": train_consuming,
                "test_consuming": test_consuming,
                "accuracy_score": accuracy_score(y_test, y_pred),
                "precision_score": precision_score(y_test, y_pred, average=None).tolist(),
                "precision_score_macro_avg": precision_score(y_test, y_pred, average="macro"),
                "recall_score": recall_score(y_test, y_pred, average=None).tolist(),
                "recall_score_macro_avg": recall_score(y_test, y_pred, average="macro"),
                "f1_score": f1_score(y_test, y_pred, average=None).tolist(),
                "f1_score_macro_avg": f1_score(y_test, y_pred, average="macro")
            }})
    time.sleep(1)