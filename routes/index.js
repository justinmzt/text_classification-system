//路由信息
const Router = require("koa-router");

module.exports = function () {
    let router = new Router({
        prefix: '/api'
    });
    require("./datasets")(router);
    require("./group")(router);
    require("./train")(router);
    require("./prediction")(router);

    return router
};