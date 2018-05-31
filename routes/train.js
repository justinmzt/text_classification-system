const Train = require("../controllers").Train;


module.exports = (router) => {
    router.get('/trains', Train.list);
    router.get('/train/:id', Train.view);
    router.post('/train', Train.create);
    router.del('/train/:id', Train.remove);
};