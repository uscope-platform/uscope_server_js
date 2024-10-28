import Router from "koa-router";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";
import SettingsBackend from "../backend/settings";
import {hil_address_map} from "../../data_model/operations_model";

class settings_router{
    public router: Router;
    private backend: SettingsBackend;

    constructor(backed: SettingsBackend) {
        this.backend = backed;

        this.router = new Router({
            prefix: endpoints_map.settings.prefix
        });

        this.router.get(endpoints_map.settings.endpoints.debug_level, async (ctx:Koa.Context) => {
            try{
                ctx.type = 'text';
                ctx.body = await this.backend.get_debug_level();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.settings.endpoints.debug_level, async (ctx:Koa.Context) => {
            try{
                let level = <any>ctx.request.rawBody;
                await this.backend.set_debug_level(<string>level.level)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.get(endpoints_map.settings.endpoints.hil_address_map, async (ctx:Koa.Context) => {
            try{
                ctx.body = await this.backend.get_hil_map();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.settings.endpoints.hil_address_map, async (ctx:Koa.Context) => {
            try{
                let level = <hil_address_map>ctx.request.body;
                await this.backend.set_hil_map(level)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

    }
}

export default settings_router;

