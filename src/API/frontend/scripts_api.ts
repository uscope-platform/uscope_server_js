import Router from "koa-router";
import database from "../../Database/Database";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";
import script_model, {script_edit_model} from "../../data_model/script_model";

class scripts_router {
    public router: Router;
    public db: database;
    constructor(db: database) {
        this.db = db

        this.router = new Router({
            prefix: endpoints_map.script.prefix
        });

        this.router.get(endpoints_map.script.endpoints.hash, async (ctx:Koa.Context) => {
            try{
                ctx.response.status = 200;
                ctx.response.body = await this.db.scripts.get_version();
            } catch(error:any){
                ctx.response.body = error
                ctx.response.status = 501
            }
        });


        this.router.get(endpoints_map.script.endpoints.load_all, async (ctx:Koa.Context) => {
            try{
                ctx.body = await this.db.scripts.load_all();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });



        this.router.get(endpoints_map.script.endpoints.get, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.body = await this.db.scripts.get_script(id);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.script.endpoints.add, async (ctx:Koa.Context) => {
            try{
                let  scr = <script_model>ctx.request.body;
                await this.db.scripts.add_script(scr)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.patch(endpoints_map.script.endpoints.edit, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                let e = <script_edit_model>ctx.request.body;
                ctx.body = await this.db.scripts.update_script_field(id, e.field, e.value);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.delete(endpoints_map.script.endpoints.delete, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                await this.db.scripts.remove_script(id)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


    }
}

export default scripts_router;

