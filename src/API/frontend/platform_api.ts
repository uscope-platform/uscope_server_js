import Router from 'koa-router';
import * as Koa from 'koa';

import Authenticator from '../backend/authentication'
import database from "../../Database/Database";
import {auto_login_object, user_login_object} from "../../data_model/platform_model";

interface user_add_request {
    user:string,
    password:string,
    role:string
}
class Platform_api {
    public router: Router;
    private auth: Authenticator;

    constructor(secret:string, db: database) {
        this.auth = new Authenticator(secret, db)
        this.router = new Router({
            prefix: '/platform'
        });

        this.router.post('/user', async (ctx:Koa.Context, next:Koa.Next) => {
            let body = <user_add_request>ctx.request.body;
            try{
                await this.auth.create_user(body.user, body.password, body.role)
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
            }
            next();
        });

        this.router.delete('/user/:name', async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                await this.auth.remove_user(ctx.params.name)
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
            }
            next();
        });

        this.router.post('/login/manual', async (ctx:Koa.Context, next:Koa.Next) =>{
            try {
                let body = <user_login_object>ctx.request.body;
                ctx.body = await this.auth.authenticate(body)
                ctx.status = 200;
            } catch (error:any){
                if(typeof error === "number"){
                    ctx.status = error;
                } else {
                    ctx.status = 401;
                }
                ctx.message = "Login failed";
            }
        })

        this.router.post('/login/auto', async (ctx:Koa.Context, next:Koa.Next) =>{
            try {
                let body = <auto_login_object>ctx.request.body;
                ctx.body = await this.auth.authenticate(body)
                ctx.status = 200;
            } catch (error:any){
                ctx.status = error;
                ctx.message = "Login failed";
            }
        })
    }
}

export default Platform_api;

