const Datasets = require("../models/index").Datasets;
const config = require("../config");
const env = config.backend.env;
const { spawn, execSync, exec } = require('child_process');
const { promisify } = require('util');

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

        const count = await Datasets.model.count(query);

        if (!count) {
            return ctx.body = {
                data: [],
                page
            }
        }

        page.total = count;
        const totalPage = Math.ceil(count / page.node);
        page.current = parseInt(params.page > totalPage ? totalPage : params.page);

        let data = await Datasets.model.find(query, {keywords: 0}, option);

        ctx.body = {
            data,
            page
        }
    },
    view: async (ctx, next) => {
        const id = ctx.params.id;

        let data = await Datasets.model.findById(id);
        //
        ctx.body = {
            success: true,
            data
        }
    },
    create: async (ctx, next) => {
        const params = ctx.request.body;
        const query = {};
        if (params.train_file === undefined || params.categories === undefined || params.test_file === undefined|| params.categories === undefined) {
            return ctx.body = "参数错误"
        }
        if (params.name !== undefined) query.name = params.name;
        if (params.train_file !== undefined) query.train_file = params.train_file;
        if (params.test_file !== undefined) query.test_file = params.test_file;
        if (params.categories !== undefined) query.categories = params.categories;

        let data = await Datasets.create(query);

        ctx.body = {
            success: true,
            data
        }
    },
    update: async (ctx, next) => {
        const params = ctx.request.body;
        const id = ctx.params.id;
        const set = {};

        if (params.train_file !== undefined) set.train_file = params.train_file;
        if (params.test_file !== undefined) set.test_file = params.test_file;
        if (params.categories !== undefined) set.categories = params.categories;

        let data = await Datasets.model.update({_id: id}, {$set: set});

        ctx.body = {
            success: true,
            data
        }
    },
    open: async (ctx, next) => {
        const id = ctx.params.id;
        await Datasets.model.update({_id: id}, {$set: {status: 1}});
        const ls = spawn(config.backend.python[env], [config.backend.path.training[env], id]);
        await Datasets.model.update({_id: id}, {$set: {pid: ls.pid}});

        ctx.body = {
            success: true,
        }
    },
    shutdown: async (ctx, next) => {
        const id = ctx.params.id;
        try {
            const item = await Datasets.model.findById(id);
            if (item.pid) {
                await promisify(exec)(config.backend.shutdown[env](item.pid));
            }
            await Datasets.model.update({_id: id}, {$set: {status: 0, pid: null}});

            ctx.body = {
                success: true,
            }
        }
        catch (err) {
            console.log(err);
            await Datasets.model.update({_id: id}, {$set: {status: 0, pid: null}});
            ctx.body = {}
        }
    },
    remove: async (ctx, next) => {
        const id = ctx.params.id;

        let data = await Datasets.model.remove({_id: id});

        ctx.body = {
            success: true,
            data
        }
    },
};