import Router from "koa-router";
import database from "../../Database/Database";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";
import program_model, {program_edit_model} from "../../data_model/program_model";

class programs_router {
    public router: Router;
    public db: database;
    constructor(db: database) {
        this.db = db

        this.router = new Router({
            prefix: endpoints_map.program.prefix
        });

        this.router.get(endpoints_map.program.endpoints.hash, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.response.status = 200;
                ctx.response.body = await this.db.programs.get_version();
            } catch(error:any){
                ctx.response.body = error
                ctx.response.status = 501
            }
        });


        this.router.get(endpoints_map.program.endpoints.load_all, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.body = await this.db.programs.load_all();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });



        this.router.get(endpoints_map.program.endpoints.get, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.body = await this.db.programs.get_program(id);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.program.endpoints.add, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let  prg = <program_model>ctx.request.body;
                await this.db.programs.add_program(prg)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.patch(endpoints_map.program.endpoints.edit, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                let e = <program_edit_model>ctx.request.body;
                ctx.body = await this.db.programs.update_program_field(id, e.field, e.value);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.delete(endpoints_map.program.endpoints.delete, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                await this.db.programs.remove_program(id)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


    }
}

export default programs_router;

