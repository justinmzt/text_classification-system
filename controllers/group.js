const Group = require("../models/index").Group;
const Train = require("../models/index").Train;
const Model = require("../models/index").Model;
const Datasets = require("../models/index").Datasets;
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
module.exports = {
    list: async (ctx, next) => {
        try {
            const did = await getDid();
            const params = ctx.request.query;
            const query = {datasets_id: did};
            const page = {
                total: 0,
                page: 0,
                node: config.backend.group.page_node
            };
            const option = {sort: {create_at: -1}, limit: page.node};
            if (params.page !== undefined) {
                option.skip = page.node * (params.page - 1)
            }

            const count = await Group.model.count(query);

            if (!count) {
                return ctx.body = {
                    data: [],
                    page
                }
            }

            page.total = count;
            const totalPage = Math.ceil(count / page.node);
            page.current = params.page > totalPage ? totalPage : params.page;

            let data = await Group.model.find(query, {}, option);

            ctx.body = {
                data,
                page
            }
        }
        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "获取训练组列表", err_msg}
        }

    },
    view: async (ctx, next) => {
        try {
            const did = await getDid();

            const id = ctx.params.id;

            ctx.body = await Group.model.findById(id);

        }
        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "获取训练组数据", err_msg}
        }
    },
    chart: async (ctx, next) => {
        try {
            const did = await getDid();
            const id = ctx.params.id;
            const group = await Group.model.findById(id);
            const trains = await Train.model.find({_id: {$in: group.trains}});
            const model_map = {};
            for (let i = 0; i < trains.length; i++) {
                model_map[trains[i].model_id] = await Model[trains[i].type].model.findOne({_id: trains[i].model_id}, {__v: 0, _id: 0, create_at: 0});
            }
            ctx.body = {
                datasets: await Datasets.model.findById(did),
                group,
                trains,
                model_map
            };

        }
        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "获取训练组数据", err_msg}
        }
    },
    create: async (ctx, next) => {
        try {
            const did = await getDid();

            const params = ctx.request.body;
            const query = {datasets_id: did};
            if (params.name !== undefined) query.name = params.name;
            if (params.trains !== undefined) query.trains = params.trains;

            let data = await Group.create(query);

            ctx.body = {
                data
            }
        }
        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "添加训练组", err_msg}
        }
    },
    update: async (ctx, next) => {
        try {
            const did = await getDid();
            const params = ctx.request.body;
            const id = ctx.params.id;
            const set = {};

            if (params.name !== undefined) set.name = params.name;
            if (params.trains !== undefined) set.trains = params.trains;

            let data = await Group.model.update({_id: id}, {$set: set});

            ctx.body = {
                data
            }
        }

        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "修改训练组", err_msg}
        }
    },
    remove: async (ctx, next) => {
        try {
            const did = await getDid();
            const id = ctx.params.id;

            let data = await Group.model.remove({_id: id});

            ctx.body = {
                data
            }
        }

        catch (err_msg) {
            ctx.status = 406;
            ctx.body = {err_name: "删除训练组", err_msg}
        }
    },
};