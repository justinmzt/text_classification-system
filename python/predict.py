import sys
import time
import os
import json
import numpy as np
from socket import *
import jieba
from pymongo import MongoClient  # 连接mongoDB，读取配置
from bson.objectid import ObjectId

root = os.path.dirname(os.path.abspath(__file__))

def getAbsPath(path):
    if path[0] == '.':
        return os.path.join(root, os.path.relpath(path))
    return path

# models
model_dir_path = os.path.join(root, "models")
if not os.path.exists(model_dir_path):
    os.makedirs(model_dir_path)

client = MongoClient()
db = client.mao

prediction_id = sys.argv[1]

prediction = db.predictions.find_one({"_id": ObjectId(prediction_id)})

datasets = db.datasets.find_one({"_id": ObjectId(prediction["datasets_id"])})

def getTFObj(datasets):
    real_train_file = getAbsPath(datasets["train_file"])
    if os.path.exists('%s.m.npy' % real_train_file):
        print("发现词频文件，正在读取...")
        return np.load('%s.m.npy' % real_train_file)[()]
    else:
        return False

tfv = getTFObj(datasets)
if tfv :
    print("词频读取完成")
else:
    print("未找到词频文件")
    sys.exit()


models = {}
for _ in prediction["models"]:
    model_path = os.path.join(model_dir_path, "%s.npy" % _)
    if not os.path.exists(model_dir_path):
        print("未找到模型文件")
        sys.exit()
    models[_] = np.load(model_path)[()]

def decision_function(model, pred_tfidf):
    if hasattr(model, "predict_log_proba"):
        return model.predict_log_proba(pred_tfidf)[0].tolist()
    return model.decision_function(pred_tfidf)[0].tolist()

bufsize = 16384  # 定义缓冲大小
udpClient = socket(AF_INET, SOCK_DGRAM)  # 创建客户端
udpClient.bind(("127.0.0.1", 41234))

db.predictions.update_one({"_id": ObjectId(prediction_id)}, {"$set": {"status": 2}})
while True:
    data, recvaddr = udpClient.recvfrom(bufsize)  # 接收数据和返回地址，地址用于返回数据
    udp_data = data.decode(encoding="utf-8")
    print(udp_data)
    x_pred = [" ".join(jieba.cut(udp_data))]
    pred_tfidf = tfv.transform(x_pred)
    predicts = {"categories": datasets["categories"]}
    for _ in models:
        predicts[_] = {
            "pred": int(models[_].predict(pred_tfidf)[0]),
            "decision_function": decision_function(models[_], pred_tfidf),
        }
    response_data = json.dumps(predicts).encode(encoding="utf-8")
    udpClient.sendto(response_data, recvaddr)



