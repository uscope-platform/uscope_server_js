import Router from "koa-router";
import database from "../../Database/Database";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";

class scripts_router {
    public router: Router;
    public db: database;
    constructor(db: database) {
        this.db = db

        this.router = new Router({
            prefix: endpoints_map.script.prefix
        });

        this.router.get(endpoints_map.script.endpoints.hash, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.body = await this.db.scripts.get_version();
                ctx.status = 200;
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
            }
            next();
        });


        this.router.get(endpoints_map.script.endpoints.load_all, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.body = await this.db.scripts.load_all()
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
            }
            next();
        });



        this.router.get(endpoints_map.script.endpoints.get, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.body = await this.db.scripts.get_script(id);
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
            }
            next();
        });


        this.router.post(endpoints_map.script.endpoints.add, async (ctx:Koa.Context, next:Koa.Next) => {
            try{

                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
            }
            next();
        });

        this.router.patch(endpoints_map.script.endpoints.edit, async (ctx:Koa.Context, next:Koa.Next) => {
            try{

                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
            }
            next();
        });

        this.router.delete(endpoints_map.script.endpoints.delete, async (ctx:Koa.Context, next:Koa.Next) => {
            try{

                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
            }
            next();
        });


    }
}

export default scripts_router;

