import Router from 'koa-router';
import * as Koa from 'koa';
import {Authenticator, http_error} from "#api_backend";
import {database} from "#database";
import {auto_login_object, db_dump, user_login_object} from "#models";
import {endpoints_map} from ".";
import {hw_interface} from "#hw";

interface user_add_request {
    user:string,
    password:string,
    role:string
}

interface user_edit_request {
    user?:string,
    password?:string,
    role?:string
}

const ROLES = ["admin", "user", "operator"];

export class platform_router {
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
            const already_set_up = new http_error(409, "The platform is already set up");
            // cheap refusal before the password is hashed, the creation checks again under the lock
            if(await this.db.platform.has_users()) throw already_set_up;
            let body = <user_add_request>ctx.request.body;
            if(!body.user || !body.password) throw new http_error(400, "A username and a password are needed");
            // the first account is the administrator, whatever is asked: the platform could not be managed otherwise
            if(!await this.auth.create_first_user(body.user, body.password, "admin")) throw already_set_up;
            ctx.status = 200;
        })

        this.router.post(endpoints_map.platform.endpoints.add_user, async (ctx:Koa.Context) => {
            let body = <user_add_request>ctx.request.body;

            await this.auth.create_user(body.user, body.password, body.role);
            ctx.status = 200;
        });

        this.router.patch(endpoints_map.platform.endpoints.edit_user, async (ctx:Koa.Context) => {
            const name = ctx.params.name;
            const body = <user_edit_request>ctx.request.body ?? {};
            const new_name = body.user?.trim();

            const current = await this.db.platform.get_user(name);
            if(current === undefined) throw new http_error(404, "There is no user called " + name);
            if(new_name === undefined && body.password === undefined && body.role === undefined) throw new http_error(400, "There is nothing to change");
            if(new_name === "") throw new http_error(400, "The username cannot be empty");
            if(body.password === "") throw new http_error(400, "The password cannot be empty");
            if(body.role !== undefined && !ROLES.includes(body.role)) throw new http_error(400, "The role has to be one of " + ROLES.join(", "));
            if(new_name !== undefined && new_name !== name && await this.db.platform.user_exists(new_name)){
                throw new http_error(409, "There is a user called " + new_name + " already");
            }
            // the platform could not be managed without an administrator
            if(body.role !== undefined && body.role !== "admin" && current.role === "admin" && await this.db.platform.count_admins() <= 1){
                throw new http_error(409, "This is the only administrator, there has to be one");
            }

            await this.auth.update_user(name, {
                ...(new_name !== undefined ? {username: new_name} : {}),
                ...(body.password !== undefined ? {password: body.password} : {}),
                ...(body.role !== undefined ? {role: body.role} : {}),
            });
            ctx.status = 200;
        });

        this.router.delete(endpoints_map.platform.endpoints.remove_user, async (ctx:Koa.Context) => {
            // the platform could not be managed without an administrator
            const current = await this.db.platform.get_user(ctx.params.name);
            if(current?.role === "admin" && await this.db.platform.count_admins() <= 1){
                throw new http_error(409, "This is the only administrator, there has to be one");
            }
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
                ctx.body = process.env.VERSION;
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
