const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const clients = [];

router.get('/subscribe', async (ctx, next) => {
  const message = await new Promise((resolve) => {
    clients.push(resolve);

    ctx.req.on('close', () => {
      const position = clients.indexOf(resolve);
      clients.splice(position, 1);
    });
  });
  ctx.status = 200;
  ctx.body = message;
});

router.post('/publish', async (ctx, next) => {
  const message = ctx.request.body.message;
  if (!message) ctx.throw(400);

  clients.forEach((resolve) => {
    ctx.body = message;
    resolve(message);
  });

  clients.length = 0;
  ctx.body = message;
});

app.use(router.routes());

module.exports = app;
