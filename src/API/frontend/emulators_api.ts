import Router from "koa-router";
import database from "../../Database/Database";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";
import emulator_model, {emulator_edit_model} from "../../data_model/emulator_model";

class emulators_router {
    public router: Router;
    public db: database;
    constructor(db: database) {
        this.db = db

        this.router = new Router({
            prefix: endpoints_map.emulator.prefix
        });

        this.router.get(endpoints_map.emulator.endpoints.hash, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.response.status = 200;
                ctx.response.body = await this.db.emulators.get_version();
            } catch(error:any){
                ctx.response.body = error
                ctx.response.status = 501
            }
        });


        this.router.get(endpoints_map.emulator.endpoints.load_all, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.body = await this.db.emulators.load_all();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });



        this.router.get(endpoints_map.emulator.endpoints.get, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.body = await this.db.emulators.get_emulator(id);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.emulator.endpoints.add, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let  emu = <emulator_model>ctx.request.body;
                await this.db.emulators.add_emulator(emu)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.patch(endpoints_map.emulator.endpoints.edit, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                let e = <emulator_edit_model>ctx.request.body;
                ctx.body = await this.db.emulators.update_emulator_field(id, e.field, e.value);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.delete(endpoints_map.emulator.endpoints.delete, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                await this.db.emulators.remove_emulator(id)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

    }
}

export default emulators_router;

