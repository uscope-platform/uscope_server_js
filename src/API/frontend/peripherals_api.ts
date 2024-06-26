import Router from "koa-router";
import database from "../../Database/Database";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";
import peripheral_model, {peripheral_edit_model} from "../../data_model/peripheral_model";

class peripherals_router {
    public router: Router;
    public db: database;
    constructor(db: database) {
        this.db = db

        this.router = new Router({
            prefix: endpoints_map.peripheral.prefix
        });

        this.router.get(endpoints_map.peripheral.endpoints.hash, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.response.status = 200;
                ctx.response.body = await this.db.peripherals.get_version();
            } catch(error:any){
                ctx.response.message = error
                ctx.response.status = 501
                next();
            }
        });


        this.router.get(endpoints_map.peripheral.endpoints.load_all, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.body = await this.db.peripherals.load_all();
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next()
            }
        });



        this.router.get(endpoints_map.peripheral.endpoints.get, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.body = await this.db.peripherals.get_peripheral(id);
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next()
            }
        });


        this.router.post(endpoints_map.peripheral.endpoints.add, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let  prg = <peripheral_model>ctx.request.body;
                await this.db.peripherals.add_peripheral(prg)
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next()
            }
        });

        this.router.patch(endpoints_map.peripheral.endpoints.edit, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                let e = <peripheral_edit_model>ctx.request.body;
                ctx.body = await this.db.peripherals.update_peripheral_field(id, e.field, e.value);
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next()
            }
        });

        this.router.delete(endpoints_map.peripheral.endpoints.delete, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                await this.db.peripherals.remove_peripheral(id)
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next()
            }
        });


    }
}

export default peripherals_router;

