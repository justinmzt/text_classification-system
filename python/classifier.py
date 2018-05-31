# -*- coding: UTF-8 -*-
from sklearn.metrics import precision_score
from sklearn.metrics import recall_score
import numpy as np
from data_helper import Timer

"""
类名：分类器
Parameters:
self.name: {String} 训练集路径
self.model: {Object} 测试集路径

self.fit(self, train_tfidf, y_train): {function} 通过向量空间模型表示和标签集训练模型
self.predict(self, test_tfidf): {function} 通过向量空间模型表示获取预测结果
"""
class Classifier():
    def __init__(self, name, model=None):
        self.name = name
        if model:
            self.model = model

    def fit(self, train_tfidf, y_train):
        timer = Timer()
        print("开始%s训练" % self.name)
        self.model.fit(train_tfidf, y_train)  # 特征数据直接灌进来
        timer.print()

    def _compare(self, predict, test):
        sum = len(predict)
        correct = 0
        for i in range(sum):
            if (predict[i] == test[i]):
                correct += 1
            else:
                pass  # print(test_dict[i],"\n", test_Y[i] and "句子有问题\n" or "句子没问题\n")
        return correct / sum

    def predict(self, test_tfidf):
        return self.model.predict(test_tfidf)

    def test(self, y_test, test_tfidf):
        timer = Timer()
        predict = self.model.predict(test_tfidf)
        timer.print("测试")
        print("测试集数量", len(predict))
        print("%s测试数据的正确率: %f" % (self.name, self._compare(predict, y_test)))
        print("%s测试数据的精度: " % (self.name))
        print(precision_score(y_test, predict, average=None))
        print("%s测试数据的召回率: " % (self.name))
        print(recall_score(y_test, predict, average=None))

    def stat(self, y_true, predict):
        print("测试集数量", len(predict))
        print("%s测试数据的正确率: %f" % (self.name, self._compare(predict, y_true)))
        print("%s测试数据的精度: " % (self.name))
        print(precision_score(y_true, predict, average=None))
        print("%s测试数据的召回率: " % (self.name))
        print(recall_score(y_true, predict, average=None))