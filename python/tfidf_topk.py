import sys
import os
import json
import numpy as np
from pymongo import MongoClient  # 连接mongoDB，读取配置
from bson.objectid import ObjectId

from text_classification import TextClassification

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

x_train, y_train = quest.readFileAndCut(quest.train_filename)
x_test, y_test = quest.readFileAndCut(quest.test_filename)

train_tfidf, test_tfidf = quest.train_tf(x_train, x_test)

feature_names = quest.tfv().get_feature_names()

keywords = {}
category_length = len(datasets["categories"])
for i in range(category_length):
    keywords[i] = {}

y_length = len(y_train)
for row in range(len(y_train)):
    t = y_train[row]
    for col in train_tfidf.getrow(row).nonzero()[1]:
        keywords[t][col] = train_tfidf[row, col]
        print("%d/%d" % (row, y_length), end='\r')

for i in range(category_length):
    keywords[i] = [{"name": feature_names[_], "weight": keywords[i][_]} for _ in sorted(keywords[i], key=lambda x:keywords[i][x], reverse=True)]

print("ready to input")
if "topK" in datasets:
    topK = datasets["topK"]
else:
    topK = 100

result = []
for i in range(category_length):
    keywords[i] = keywords[i][:topK]

db.datasets.update_one({"_id": ObjectId(datasets_id)}, {"$set": {"keywords": json.dumps(keywords)}})