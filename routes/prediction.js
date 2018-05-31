const Prediction = require("../controllers").Prediction;


module.exports = (router) => {
    router.get('/predictions', Prediction.list);
    router.get('/prediction/:id', Prediction.view);
    router.post('/prediction', Prediction.create);
    router.post('/prediction/perform', Prediction.perform);
    router.put('/prediction/:id', Prediction.update);
    router.del('/prediction/:id', Prediction.remove);
    router.patch('/prediction/open/:id', Prediction.open);
    router.patch('/prediction/shutdown/:id', Prediction.shutdown);
};