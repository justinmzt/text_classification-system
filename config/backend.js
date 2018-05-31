// 后台配置
const os = require("os");
var config = {
    env: os.platform(),
    python: {
        linux: "python3",
        win32: "python"
    },
    path: {
        training: {
            linux: "/app/python/text_classification/training.py",
            win32: "d:\\Anaconda_Projects\\naive_bayes-news_classification\\training.py"
        },
        predict: {
            linux: "/app/python/text_classification/predict.py",
            win32: "d:\\Anaconda_Projects\\naive_bayes-news_classification\\predict.py"
        }
    },
    shutdown: {
        linux: (pid) => {return `sudo kill -9 ${pid}`},
        win32: (pid) => {return `powershell -C taskkill /f /pid ${pid} /t`}
    },
    datasets: {
        page_node: 20
    },
    group: {
        page_node: 20
    },
    train: {
        page_node: 20
    },
    illegal: {
        page_node: 20,
        latest_limit: 10
    }
};

module.exports = config;