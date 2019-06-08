const Koa = require('koa');
const Router = require('koa-router');
const User = require('./models/User');
const mongoose = require('mongoose');

const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = {error: err.message};
    } else {
      if (err.name === 'ValidationError') {
        ctx.status = 400;
        const errorMessages = {errors: {}};
        Object.keys(err.errors).forEach((error) => {
          errorMessages.errors[error] = err.errors[error].message;
        });
        ctx.body = errorMessages;
      } else {
        ctx.status = 500;
        ctx.body = {error: 'Internal server error'};
      }
    }
  }
});

const router = new Router();

router.get('/users', async (ctx) => {
  ctx.status = 200;
  ctx.body = await User.find({}).exec();
});

router.get('/users/:id', async (ctx) => {
  const id = ctx.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }

  const userById = await User.findById(id)

  if (!userById) {
    ctx.status = 404;
    return;
  }

  ctx.status = 200;
  ctx.body = userById;
});

router.patch('/users/:id', async (ctx) => {
  const id = ctx.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  const user = await User.findOne({_id: ctx.params.id}).exec();
  if (user) {
    if (ctx.request.body.email) {
      user.email = ctx.request.body.email;
    }
    if (ctx.request.body.displayName) {
      user.displayName = ctx.request.body.displayName;
    }
    await user.validate();
    await user.save();

    ctx.body = await User.findById(ctx.params.id).exec();
  } else {
    ctx.status = 404;
    return;
  }
});

router.post('/users', async (ctx) => {
  ctx.body = await User.create({
    email: ctx.request.body.email, displayName: ctx.request.body.displayName,
  });
});

router.delete('/users/:id', async (ctx) => {
  const id = ctx.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  const deletedUser = await User.findByIdAndRemove(id);

  if (deletedUser) {
    ctx.body = deletedUser;
  }
});

app.use(router.routes());

module.exports = app;
