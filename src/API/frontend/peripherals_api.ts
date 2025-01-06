import Router from "koa-router";
import * as Koa from "koa";
import {database} from "../../Database";
import {endpoints_map} from ".";
import {peripheral_model, peripheral_edit_model, register_model} from "../../data_model";

export class peripherals_router {
    public router: Router;
    public db: database;
    constructor(db: database) {
        this.db = db

        this.router = new Router({
            prefix: endpoints_map.peripheral.prefix
        });

        this.router.get(endpoints_map.peripheral.endpoints.hash, async (ctx:Koa.Context) => {
            try{
                ctx.response.status = 200;
                ctx.response.body = await this.db.peripherals.get_version();
            } catch(error:any){
                ctx.response.body = error
                ctx.response.status = 501
            }
        });


        this.router.get(endpoints_map.peripheral.endpoints.load_all, async (ctx:Koa.Context) => {
            try{
                ctx.body = await this.db.peripherals.load_all();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });



        this.router.get(endpoints_map.peripheral.endpoints.get, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.body = await this.db.peripherals.get_peripheral(id);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.peripheral.endpoints.add, async (ctx:Koa.Context) => {
            try{
                let  prg = <peripheral_model>ctx.request.body;
                await this.db.peripherals.add_peripheral(prg)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.patch(endpoints_map.peripheral.endpoints.edit, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                let e = <peripheral_edit_model>ctx.request.body;
                switch (e.field){
                    case "register":
                        switch (e.action){
                            case "add":
                                ctx.body = await this.db.peripherals.add_register(id, <register_model>e.value);
                                break;
                            case "edit":
                                ctx.body = await this.db.peripherals.edit_register(id, <register_model>e.value);
                                break;
                            case "remove":
                                ctx.body = await this.db.peripherals.remove_register(id, e.value);
                                break;
                        }
                        break;
                    case "field":
                        switch (e.action){
                            case "add":
                                ctx.body = await this.db.peripherals.add_field(id, e.value.id, e.value.object);
                                break;
                            case "edit":
                                ctx.body = await this.db.peripherals.edit_field(id, e.value.id, e.value.object);
                                break;
                            case "remove":
                                ctx.body = await this.db.peripherals.remove_field(id, e.value.id, e.value.object)
                                break;
                        }
                        break;
                    default:
                        ctx.body = await this.db.peripherals.update_peripheral_field(id, e.field, e.value);
                        break;
                }
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.delete(endpoints_map.peripheral.endpoints.delete, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                await this.db.peripherals.remove_peripheral(id)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


    }
}
