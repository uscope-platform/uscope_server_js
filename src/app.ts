import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

const app = new Koa();

// middleware
app.use(bodyParser());

// Require the routers
let test = require('./test.ts');

// use the routes
app.use(test.routes());


app.listen(3000);