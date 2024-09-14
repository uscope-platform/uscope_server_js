import Router from 'koa-router';
import * as Koa from 'koa';

import Authenticator from '../backend/authentication'
import database from "../../Database/Database";
import {auto_login_object, user_login_object} from "../../data_model/platform_model";
import endpoints_map from "./endpoints_map";

interface user_add_request {
    user:string,
    password:string,
    role:string
}

class platform_router {
    public router: Router;
    private auth: Authenticator;
    private db: database;

    constructor(secret:string, db: database) {
        this.auth = new Authenticator(secret, db)
        this.db = db;
        this.router = new Router({
            prefix: endpoints_map.platform.prefix
        });

        this.router.get(endpoints_map.platform.endpoints.get_users, async (ctx:Koa.Context, next:Koa.Next) => {
            ctx.body = await this.db.platform.load_all();
            ctx.status = 200;
            next();
        });

        this.router.get(endpoints_map.platform.endpoints.onboarding, async (ctx:Koa.Context, next: Koa.Next)=>{
            ctx.body = !(await this.db.platform.has_users());
            ctx.status = 200;
            next();
        })

        this.router.post(endpoints_map.platform.endpoints.onboarding, async (ctx:Koa.Context, next: Koa.Next)=>{

            ctx.status = 501;
            next();
        })

        this.router.post(endpoints_map.platform.endpoints.add_user, async (ctx:Koa.Context, next:Koa.Next) => {
            let body = <user_add_request>ctx.request.body;

            await this.auth.create_user(body.user, body.password, body.role);
            ctx.status = 200;
            next();
        });

        this.router.delete(endpoints_map.platform.endpoints.remove_user, async (ctx:Koa.Context, next:Koa.Next) => {
            await this.auth.remove_user(ctx.params.name);
            ctx.status = 200;
            next();
        });

        this.router.post(endpoints_map.platform.endpoints.manual_login, async (ctx:Koa.Context, next:Koa.Next) =>{
            let body = <user_login_object>ctx.request.body;
            ctx.body = await this.auth.authenticate(body);
            ctx.status = 200;
        })

        this.router.post(endpoints_map.platform.endpoints.auto_login, async (ctx:Koa.Context, next:Koa.Next) =>{
            let body = <auto_login_object>ctx.request.body;
            ctx.body = await this.auth.authenticate(body);
            ctx.status = 200;
        })
    }
}

export default platform_router;

