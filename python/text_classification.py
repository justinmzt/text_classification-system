# -*- coding: UTF-8 -*-
import os
import sys
import jieba
import numpy as np
from data_helper import Timer, write_file
from sklearn.feature_extraction.text import TfidfVectorizer

root = os.path.dirname(os.path.abspath(__file__))

def getAbsPath(path):
    if path[0] == '.':
        return os.path.join(root, os.path.relpath(path))
    return path

"""
类名：文本分类
Parameters:
self.train_filename: {String} 训练集路径
self.test_filename: {String} 测试集路径

self.getCatToId(self): {function} 获取类别词汇表
self.loadStopwords(self): {function} 读取停用词表
self.readFileAndCut(self): {function} 读取分词文件或文件并分词
self.train_tf(self): {function} 读取词频文件或抽取词频
self.tfv(self): {function} 读取词频特征库
"""
class TextClassification:
    def __init__(self, train_filename, test_filename, categories):
        self.train_filename = train_filename
        self.test_filename = test_filename
        if not os.path.exists(train_filename) or not os.path.exists(train_filename):
            print("未找到文件")
            sys.exit()
        self.getCatToId(categories)
        self.loadStopwords()

    # 读取分类目录，固定
    def getCatToId(self, categories):
        self.cat_to_id = dict(zip(categories, range(len(categories))))

    # 载入停用词库
    def loadStopwords(self):
        stopwords_dict = {}
        stopwords = open(getAbsPath('./chinese_stopwords.txt')).readlines()
        for i in stopwords:
            stopword = i.rstrip()
            if stopword == '':
                stopword = ' '
            stopwords_dict[stopword] = True
        self.stopwords = [word for word in stopwords_dict]

    def readFileAndCut(self, filename):
        x_result, y_result = [], []
        if os.path.exists('%s.cut' % filename):
            print("发现分词文件，正在读取...")
            with open('%s.cut' % filename, 'r', encoding='utf8') as tr:
                for line in tr:
                    label, content = line.strip().split('\t', 1)
                    if content:
                        x_result.append(content)
                        y_result.append(int(label))
            return x_result, y_result
        else:
            print("正在读取文件...")
            with open(filename, 'r', encoding='utf8') as tr:
                for line in tr:
                    label, content = line.strip().split('\t')
                    if content:
                        x_result.append(content)
                        y_result.append(label)
            y_result = [self.cat_to_id[_] for _ in y_result]
            print("正在中文分词...")
            x_result = [' '.join(jieba.cut(content)) for content in x_result]
            write_file('%s.cut' % filename, x_result, y_result)
            return x_result, y_result

    def train_tf(self, x_train, x_test):
        timer = Timer()
        train_tfidf, test_tfidf = {}, {}
        if os.path.exists('%s.tf.npy' % self.train_filename):
            print("发现词频文件，正在读取...")
            train_tfidf = np.load('%s.tf.npy' % self.train_filename)[()]
        if os.path.exists('%s.tf.npy' % self.test_filename):
            test_tfidf = np.load('%s.tf.npy' % self.test_filename)[()]
            timer.print("词频读取")
        else:
            print("未发现词频文件，正在抽取关键词...")
            tfv = TfidfVectorizer(ngram_range=(1, 1), stop_words=self.stopwords, use_idf=1, smooth_idf=1,
                                  sublinear_tf=1)
            train_tfidf = tfv.fit_transform(x_train)
            test_tfidf = tfv.transform(x_test)
            np.save('%s.tf' % self.train_filename, train_tfidf)
            np.save('%s.tf' % self.test_filename, test_tfidf)
            np.save('%s.m' % self.train_filename, tfv)
            timer.print("关键词抽取")
        return train_tfidf, test_tfidf

    def tfv(self):
        return np.load('%s.m.npy' % self.train_filename)[()]
