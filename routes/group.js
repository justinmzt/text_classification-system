const Group = require("../controllers").Group;


module.exports = (router) => {
    router.get('/groups', Group.list);
    router.get('/group/:id/view', Group.view);
    router.get('/group/:id/chart', Group.chart);
    router.post('/group', Group.create);
    router.put('/group/:id', Group.update);
    router.del('/group/:id', Group.remove);
};