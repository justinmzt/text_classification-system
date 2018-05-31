const Prediction = require("../models").Prediction;
const Train = require("../models").Train;
const Datasets = require("../models").Datasets;
const predict = require("../lib/predict");
const config = require("../config");
const env = config.backend.env;
const { spawn, execSync, exec } = require('child_process');
const { promisify } = require('util');
const getDid = async () => {
    try {
        const dataset = await Datasets.model.findOne({status: 2});
        return dataset._id
    }
    catch (err) {
        throw "请开启数据集项目。"
    }
};
module.exports = {
    list: async (ctx, next) => {
        const params = ctx.request.query;
        const query = {};
        const page = {
            total: 0,
            page: 0,
            node: config.backend.datasets.page_node
        };
        const option = {sort: {create_at: -1}, limit: page.node};
        if (params.page !== undefined) {
            option.skip = page.node * (params.page - 1)
        }
        const count = await Prediction.model.count(query);
        if (!count) {
            return ctx.body = {
                data: [],
                page
            }
        }
        page.total = count;
        const totalPage = Math.ceil(count / page.node);
        page.current = parseInt(params.page > totalPage ? totalPage : params.page);
        let data = await Prediction.model.find(query, {}, option);
        ctx.body = {
            data,
            page
        }
    },
    view: async (ctx, next) => {
        const id = ctx.params.id;
        ctx.body = await Prediction.model.findById(id);
    },
    create: async (ctx, next) => {
        try {
            const did = await getDid();
            const params = ctx.request.body;
            const query = {
                datasets_id: did,
            };
            if (params.name === undefined || params.models === undefined) {
                return ctx.body = "参数错误"
            }
            query.name = params.name;
            query.models = params.models;
            ctx.body = await Prediction.create(query)
        }
        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "添加训练", err_msg}
        }

    },
    update: async (ctx, next) => {
        const params = ctx.request.body;
        const id = ctx.params.id;
        const set = {};

        if (params.models !== undefined) set.models = params.models;

        let data = await Prediction.model.update({_id: id}, {$set: set});

        ctx.body = {
            success: true,
            data
        }
    },
    perform: async(ctx, next) => {
        try {
            await getDid();
            const params = ctx.request.body;
            const data = await predict(params.segment);
            const data_ = JSON.parse(data);
            const categories = data_.categories;
            delete data_.categories;
            const result = {
                categories,
                cLen: categories.length
            };
            for (let key of Object.keys(data_)) {
                const df = {};
                const train = await Train.model.findOne({model_id: key});
                data_[key].type = train.type;
                data_[key].pred = categories[data_[key].pred];
                for (let i = 0; i < categories.length; i++) {
                    df[categories[i]] = data_[key].decision_function[i]
                }
                data_[key].decision_function = df
            }
            result.preds = data_;
            ctx.body = result
        }
        catch (err) {
            console.log(err);
            ctx.status = 406;
            ctx.body = {err_name: "演示文本分类", err}
        }
    },
    open: async (ctx, next) => {
        const id = ctx.params.id;
        await Prediction.model.update({_id: id}, {$set: {status: 1}});
        const ls = spawn(config.backend.python[env], [config.backend.path.predict[env], id]);
        await Prediction.model.update({_id: id}, {$set: {pid: ls.pid}});
        ctx.body = "开启成功"
    },
    shutdown: async (ctx, next) => {
        const id = ctx.params.id;
        try {
            const item = await Prediction.model.findById(id);
            if (item.pid) {
                await promisify(exec)(config.backend.shutdown[env](item.pid));
            }
            await Prediction.model.update({_id: id}, {$set: {status: 0, pid: null}});
            ctx.body = "关闭成功"
        }
        catch (err) {
            console.log(err);
            await Prediction.model.update({_id: id}, {$set: {status: 0, pid: null}});
            ctx.body = {}
        }
    },
    remove: async (ctx, next) => {
        const id = ctx.params.id;
        let data = await Prediction.model.remove({_id: id});
        ctx.body = {
            data
        }
    },
};