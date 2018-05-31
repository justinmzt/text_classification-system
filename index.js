const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-bodyparser');

app.use(bodyParser());

// response
const router = require('./routes')();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(8082);

console.log(`Now listening 8082`)