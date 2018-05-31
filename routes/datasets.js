const Datasets = require("../controllers").Datasets;


module.exports = (router) => {
    router.get('/datasets', Datasets.list);
    router.get('/dataset/:id', Datasets.view);
    router.post('/dataset', Datasets.create);
    router.put('/dataset/:id', Datasets.update);
    router.del('/dataset/:id', Datasets.remove);
    router.patch('/dataset/open/:id', Datasets.open);
    router.patch('/dataset/shutdown/:id', Datasets.shutdown);
};