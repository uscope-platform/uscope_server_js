import Router from "koa-router";
import database from "../../Database/Database";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";
import emulator_model, {connection_model, core_model, emulator_edit_model} from "../../data_model/emulator_model";

class emulators_router {
    public router: Router;
    public db: database;
    constructor(db: database) {
        this.db = db

        this.router = new Router({
            prefix: endpoints_map.emulator.prefix
        });

        this.router.get(endpoints_map.emulator.endpoints.hash, async (ctx:Koa.Context) => {
            try{
                ctx.response.status = 200;
                ctx.response.body = await this.db.emulators.get_version();
            } catch(error:any){
                console.log(error);
                ctx.response.body = error
                ctx.response.status = 501
            }
        });


        this.router.get(endpoints_map.emulator.endpoints.load_all, async (ctx:Koa.Context) => {
            try{
                ctx.body = await this.db.emulators.load_all();
                ctx.status = 200
            } catch(error:any){
                console.log(error);
                ctx.body = error
                ctx.status = 501
            }
        });



        this.router.get(endpoints_map.emulator.endpoints.get, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.body = await this.db.emulators.get_emulator(id);
                ctx.status = 200
            } catch(error:any){
                console.log(error);
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.emulator.endpoints.add, async (ctx:Koa.Context) => {
            try{
                let  emu = <emulator_model>ctx.request.body;
                await this.db.emulators.add_emulator(emu)
                ctx.status = 200
            } catch(error:any){
                console.log(error);
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.patch(endpoints_map.emulator.endpoints.edit, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                let e = <emulator_edit_model>ctx.request.body;

                switch (e.field){
                    case "cores":
                        switch (e.action){
                            case "add":
                                ctx.body = await this.db.emulators.add_core(id, <core_model>e.value);
                                break;
                            case "edit":
                                ctx.body = await this.db.emulators.update_core(id, <core_model>e.value);
                                break;
                            case "remove":
                                ctx.body = await this.db.emulators.remove_core(id, e.value);
                                break;
                        }
                        break;
                    case "connections":
                        switch (e.action){
                            case "add":
                                ctx.body = await this.db.emulators.add_connection(id, <connection_model>e.value);
                                break;
                            case "remove":
                                ctx.body = await this.db.emulators.remove_connection(id, e.value.source, e.value.destination);
                                break;
                        }
                        break;
                    case "dma_channel":
                        switch (e.action){
                            case "add":
                                ctx.body = await this.db.emulators.add_dma_channel(id, e.value.source, e.value.destination, e.value.object);
                                break;
                            case "rename":
                                ctx.body = await this.db.emulators.edit_dma_channel(id, e.value.source, e.value.destination, e.value.selector, e.value.object);
                                break;
                            case "edit":
                                ctx.body = await this.db.emulators.edit_dma_channel(id, e.value.source, e.value.destination, e.value.selector, e.value.object);
                                break;
                            case "remove":
                                ctx.body = await this.db.emulators.remove_dma_channel(id, e.value.source, e.value.destination, e.value.name);
                                break;
                        }
                        break;
                    default:
                        ctx.body = await this.db.emulators.edit_atomic_field(id, e.field, e.value);
                        break;
                }

                ctx.status = 200
            } catch(error:any){
                console.log(error);
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.delete(endpoints_map.emulator.endpoints.delete, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                await this.db.emulators.remove_emulator(id)
                ctx.status = 200
            } catch(error:any){
                console.log(error);
                ctx.body = error
                ctx.status = 501
            }
        });

    }
}

export default emulators_router;

