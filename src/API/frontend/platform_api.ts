import Router from 'koa-router';
import * as Koa from 'koa';

import Authenticator from '../backend/authentication'
import database from "../../Database/Database";
import {auto_login_object, db_dump, user_login_object} from "../../data_model/platform_model";
import endpoints_map from "./endpoints_map";
import hw_interface from "../../hardware_interface/hw_interface";

interface user_add_request {
    user:string,
    password:string,
    role:string
}

class platform_router {
    public router: Router;
    private auth: Authenticator;
    private db: database;
    private hw_if:hw_interface;

    constructor(secret:string, db: database, hw: hw_interface) {
        this.auth = new Authenticator(secret, db)
        this.db = db;
        this.hw_if = hw;
        this.router = new Router({
            prefix: endpoints_map.platform.prefix
        });

        this.router.get(endpoints_map.platform.endpoints.get_users, async (ctx:Koa.Context) => {
            ctx.body = await this.db.platform.load_all();
            ctx.status = 200;
        });

        this.router.get(endpoints_map.platform.endpoints.onboarding, async (ctx:Koa.Context)=>{
            ctx.body = !(await this.db.platform.has_users());
            ctx.status = 200;
        })

        this.router.post(endpoints_map.platform.endpoints.onboarding, async (ctx:Koa.Context)=>{
            let has_users = await this.db.platform.has_users();
            let body = <user_add_request>ctx.request.body;
            if(!has_users) {
                await this.auth.create_user(body.user, body.password, body.role);
            }
            ctx.status = 200;
        })

        this.router.post(endpoints_map.platform.endpoints.add_user, async (ctx:Koa.Context) => {
            let body = <user_add_request>ctx.request.body;

            await this.auth.create_user(body.user, body.password, body.role);
            ctx.status = 200;
        });

        this.router.delete(endpoints_map.platform.endpoints.remove_user, async (ctx:Koa.Context) => {
            await this.auth.remove_user(ctx.params.name);
            ctx.status = 200;
        });

        this.router.post(endpoints_map.platform.endpoints.manual_login, async (ctx:Koa.Context) =>{
            let body = <user_login_object>ctx.request.body;
            ctx.body = await this.auth.authenticate(body);
            ctx.status = 200;
        })

        this.router.post(endpoints_map.platform.endpoints.auto_login, async (ctx:Koa.Context) =>{
            let body = <auto_login_object>ctx.request.body;
            ctx.body = await this.auth.authenticate(body);
            ctx.status = 200;
        })


        this.router.get(endpoints_map.platform.endpoints.versions, async (ctx:Koa.Context) =>{

            ctx.type = 'text';
            if(ctx.params.component == "server"){
                ctx.body = "test_ver";
            } else {
                ctx.body = await this.hw_if.get_version(ctx.params.component);
            }
            ctx.status = 200;
        })

        this.router.get(endpoints_map.platform.endpoints.db_dump, async (ctx:Koa.Context) =>{
            ctx.body = await this.db.dump();
            ctx.status = 200;
        })

        this.router.post(endpoints_map.platform.endpoints.db_restore, async (ctx:Koa.Context) =>{
            let body = <db_dump>ctx.request.body;
            ctx.body = await this.db.restore(body);
            ctx.status = 200;
        })


    }
}

export default platform_router;

