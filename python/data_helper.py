# -*- coding: UTF-8 -*-
import time
class Timer():
    def __init__(self):
        self.start = time.time()
    
    def print(self, op="训练"):
        print("%s用时 %f 秒。" % (op, time.time() - self.start))

def open_file(filename, mode='r'):
    """
    常用文件操作，可在python2和python3间切换.
    mode: 'r' or 'w' for read or write
    """
#     if is_py3:
    return open(filename, mode, encoding='utf-8', errors='ignore')
#     else:
#         return open(filename, mode)

def read_file(filename):
    """读取文件数据"""
    output = []
    with open_file(filename) as f:
        output = [_.strip() for _ in f.readlines()]
    return output

def write_list(filename, array):
    """读取文件数据"""
    with open_file(filename, 'w') as f:
        f.write('\n'.join(array) + '\n')
        f.close()

def read_cnews(filename, cut_file=None):
    x, y = [], []
    with open_file(filename) as tr:
        for line in tr:
            label, content = line.strip().split('\t')
            if content:
                x.append(content)
                y.append(label)
        if cut_file:
            x = read_file(cut_file)
        return x,y

def write_file(filename, x, y):
    with open(filename,'a', encoding='utf8') as f:
        if isinstance(x, str) and isinstance(y, str):
            f.write('%s\t%s\n' % (y, x))
        elif isinstance(x, list) and isinstance(y, list):
            if len(x) != len(y):
                print("Not same scale.")
                return False
            for i in range(len(x)):
                f.write('%s\t%s\n' % (y[i], x[i]))
        else:
            print("Write False")


