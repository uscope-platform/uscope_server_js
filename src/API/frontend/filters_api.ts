import Router from "koa-router";
import {database} from "#database";
import * as Koa from "koa";
import {endpoints_map} from ".";
import {filter_model, filter_edit_model} from "#models";

export class filters_router {
    public router: Router;
    public db: database;
    constructor(db: database) {
        this.db = db

        this.router = new Router({
            prefix: endpoints_map.filter.prefix
        });

        this.router.get(endpoints_map.filter.endpoints.hash, async (ctx:Koa.Context) => {
            try{
                ctx.response.status = 200;
                ctx.response.body = await this.db.filters.get_version();
            } catch(error:any){
                ctx.response.body = error
                ctx.response.status = 501
            }
        });


        this.router.get(endpoints_map.filter.endpoints.load_all, async (ctx:Koa.Context) => {
            try{
                ctx.body = await this.db.filters.load_all();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });



        this.router.get(endpoints_map.filter.endpoints.get, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.body = await this.db.filters.get_filter(id);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.filter.endpoints.add, async (ctx:Koa.Context) => {
            try{
                let  flt = <filter_model>ctx.request.body;
                await this.db.filters.add_filter(flt)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.patch(endpoints_map.filter.endpoints.edit, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                let e = <filter_edit_model>ctx.request.body;
                ctx.body = await this.db.filters.update_filter_field(id, e.field, e.value);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.delete(endpoints_map.filter.endpoints.delete, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                await this.db.filters.remove_filter(id)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


    }
}
