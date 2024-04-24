import Koa from "koa";


export let error_handler = async  (ctx:Koa.Context, next: Koa.Next) => {
    try {
        await next();
    } catch (err:any) {
        ctx.status = err.status || 500;
        ctx.body = err.message;
    }
}
