# -*- coding: UTF-8 -*-
import sys
import os.path
from argparse import ArgumentParser
from text_classification import TextClassification
from classifier import Classifier

PROGRAM = os.path.abspath(__file__)

parser = ArgumentParser(usage="%s --train train_file --test test_file [options]" % os.path.basename(PROGRAM),
                        prog=PROGRAM,
                        description="Text Classification")

parser.add_argument("--train", required=True, metavar="file", help='Input train data file')
parser.add_argument("--test", required=True, metavar="file", help='Input test data file')
parser.add_argument("-m", default='mnb', metavar="string", help='model for classification')
if len(sys.argv) <= 1:
    sys.argv.append('-h')

args = parser.parse_args()

quest = TextClassification(train_filename=args.train, test_filename=args.test, categories=[])

x_train, y_train = quest.readFileAndCut(quest.train_filename)
x_test, y_test = quest.readFileAndCut(quest.test_filename)

train_tfidf, test_tfidf = quest.train_tf(x_train, x_test)

def execClassify(name, model):
    classifier = Classifier(name, model)
    classifier.fit(train_tfidf, y_train)
    classifier.test(y_test, test_tfidf)

if args.m == 'mnb':
    from sklearn.naive_bayes import MultinomialNB as MNB
    execClassify(name='多项式朴素贝叶斯分类器', model=MNB())
elif args.m == 'bnb':
    from sklearn.naive_bayes import BernoulliNB as BNB
    execClassify(name='伯努利朴素贝叶斯分类器', model=BNB())
elif args.m == 'linearSVC':
    from sklearn.svm import LinearSVC
    execClassify(name='线性SVM分类器', model=LinearSVC())
elif args.m == 'dt':
    from sklearn.tree import DecisionTreeClassifier
    execClassify(name='决策树分类器', model=DecisionTreeClassifier())
elif args.m == 'knn':
    from sklearn.neighbors import KNeighborsClassifier
    execClassify(name='KNN分类器', model=KNeighborsClassifier())
elif args.m == 'xgb':
    import xgboost as xgb
    dtrain = xgb.DMatrix(train_tfidf, label=y_train)
    dtest = xgb.DMatrix(test_tfidf, label=y_test)  # label可以不要，此处需要是为了测试效果
    param = {'max_depth': 6, 'eta': 0.5, 'eval_metric': 'merror', 'silent': 1, 'objective': 'multi:softmax',
             'num_class': 10}  # 参数
    evallist = [(dtrain, 'train'), (dtest, 'test')]  # 这步可以不要，用于测试效果
    num_round = 50  # 循环次数
    bst = xgb.train(param, dtrain, num_round, evallist)
    preds = bst.predict(dtest)
    classifier = Classifier(name='xgboost分类器')
    classifier.stat(y_test, preds)
