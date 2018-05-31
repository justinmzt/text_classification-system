const Train = require("../models/index").Train;
const Datasets = require("../models/index").Datasets;
const Model = require("../models/index").Model;
const config = require("../config");

const getDid = async () => {
    try {
        const dataset = await Datasets.model.findOne({status: 2});
        return dataset._id
    }
    catch (err) {
        throw "请开启数据集项目。"
    }
};
const checkType = async (params) => {
    if (params.type === undefined || Model[params.type] === undefined) {
        throw "未知的模型。"
    }
}
module.exports = {
    list: async (ctx, next) => {
        try {
            const did = await getDid();
            const params = ctx.request.query;
            const query = {datasets_id: did};
            const page = {
                total: 0,
                page: 0,
                node: config.backend.train.page_node
            };
            const option = {sort: {create_at: -1}, limit: page.node};
            if (params.page !== undefined) {
                option.skip = page.node * (params.page - 1)
            }

            const count = await Train.model.count(query);

            if (!count) {
                return ctx.body = {
                    data: [],
                    page
                }
            }

            page.total = count;
            const totalPage = Math.ceil(count / page.node);
            page.current = params.page > totalPage ? totalPage : params.page;

            const data = await Train.model.find(query, {}, option);
            const models = [];
            for (let i = 0; i < data.length; i++) {
                models.push(await Model[data[i].type].model.findOne({_id: data[i].model_id}))
            }

            ctx.body = {
                data,
                models,
                page
            }
        }
        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "获取训练列表", err_msg}
        }

    },
    view: async (ctx, next) => {
        try {
            const did = await getDid();

            const id = ctx.params.id;

            let data = await Train.model.findById(id);
            //
            ctx.body = {
                data
            }

        }
        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "获取训练数据", err_msg}
        }
    },
    create: async (ctx, next) => {
        try {
            const did = await getDid();

            const params = ctx.request.body;
            await checkType(params);
            const query = {
                datasets_id: did,
                type: params.type
            };
            if (params.name !== undefined) query.name = params.name;

            console.log(params)
            const model = await Model[query.type].create(params);

            query.model_id = model._id;

            await Train.create(query);

            ctx.body = {}
        }
        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "添加训练", err_msg}
        }
    },
    update: async (ctx, next) => {
        try {
            const did = await getDid();
            const params = ctx.request.body;
            const id = ctx.params.id;
            const set = {};

            if (params.name !== undefined) query.name = params.name;

            let data = await Train.model.update({_id: id}, {$set: set});

            ctx.body = {
                data
            }
        }

        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "修改训练", err_msg}
        }
    },
    remove: async (ctx, next) => {
        try {
            const did = await getDid();
            const id = ctx.params.id;

            let data = await Train.model.findOneAndRemove({_id: id});
            await  Model[data.type].model.remove({_id: data.model_id});

            ctx.body = {
                data: data._id
            }
        }

        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "删除训练", err_msg}
        }
    },
};