import Router from "koa-router";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";
import SettingsBackend from "../backend/settings";
import {hil_address_map} from "../../data_model/operations_model";

class settings_router{
    public router: Router;
    private backend: SettingsBackend;
    constructor(driver_host: string, driver_port: number) {
        this.backend = new SettingsBackend(driver_host, driver_port)

        this.router = new Router({
            prefix: endpoints_map.settings.prefix
        });

        this.router.get(endpoints_map.settings.endpoints.debug_level, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.type = 'text';
                ctx.body = await this.backend.get_debug_level();
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next()
            }
        });


        this.router.post(endpoints_map.settings.endpoints.debug_level, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let level = <string>ctx.request.rawBody;
                await this.backend.set_debug_level(level)
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next()
            }
        });


        this.router.get(endpoints_map.settings.endpoints.hil_address_map, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.body = await this.backend.get_hil_map();
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next()
            }
        });


        this.router.post(endpoints_map.settings.endpoints.hil_address_map, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let level = <hil_address_map>ctx.request.body;
                await this.backend.set_hil_map(level)
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next()
            }
        });

    }
}

export default settings_router;

