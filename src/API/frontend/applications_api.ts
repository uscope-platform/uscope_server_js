import Router from "koa-router";
import {database} from "../../Database";
import * as Koa from "koa";
import {endpoints_map} from ".";
import {application_edit_model, application_model} from "../../data_model";

export class applications_router {
    public router: Router;
    public db: database;
    private readonly item_types_map:{
        [index: string]: any;
    }
    private readonly item_id_map:{
        [index: string]: any;
    }
    constructor(db: database) {
        this.db = db

        this.item_types_map = {
            channel: "channels",
            irv: "initial_registers_values",
            macro: "macro",
            parameter: "parameters",
            peripheral: "peripherals",
            channel_group: "channel_groups",
            soft_core: "soft_cores",
            filter: "filters",
            selected_script: "scripts",
            selected_program: "programs"
        }

        this.item_id_map = {
            channel: "name",
            irv: "address",
            macro: "name",
            parameter: "parameter_id",
            peripheral: "name",
            channel_group: "group_name",
            soft_core: "id",
            filter: "id"
        }

        this.router = new Router({
            prefix: endpoints_map.application.prefix
        });

        this.router.get(endpoints_map.application.endpoints.hash, async (ctx:Koa.Context) => {
            try{
                ctx.response.status = 200;
                ctx.response.body = await this.db.applications.get_version();
            } catch(error:any){
                ctx.response.body = error
                ctx.response.status = 501;
            }
        });


        this.router.get(endpoints_map.application.endpoints.load_all, async (ctx:Koa.Context) => {
            try{
                ctx.body = await this.db.applications.load_all();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });



        this.router.get(endpoints_map.application.endpoints.get, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.body = await this.db.applications.get_application(id);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.application.endpoints.add, async (ctx:Koa.Context) => {
            try{
                let  app = <application_model>ctx.request.body;
                await this.db.applications.add_application(app)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.patch(endpoints_map.application.endpoints.edit, async (ctx:Koa.Context) => {
            try{
                let e = <application_edit_model>ctx.request.body;
                switch (e.action){
                    case "add":
                        await this.add_item(e);
                        break;
                    case "edit":
                        await this.edit_item(e);
                        break;
                    case "remove":
                        await this.remove_item(e);
                        break;
                }
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.delete(endpoints_map.application.endpoints.delete, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                await this.db.applications.remove_application(id)
                ctx.status = 200
            } catch(error:any){
                ctx.response.body = error
                ctx.response.status = 501
            }
        });
    }

    add_item = async (e: application_edit_model)=>{
        let app = await this.db.applications.get_application(e.application)

        if(e.object === "misc"){
            let param_name = <string>e.item["name"];
            app.miscellaneous[param_name] = e.item["value"];
        } else {
            app[this.item_types_map[e.object]].push(e.item);
        }
        await this.db.applications.update_application_field(app);
    }

    edit_item = async (e: application_edit_model) =>{
        let app = await this.db.applications.get_application(e.application)

        if(e.object === "misc"){
            if(!e.item["edit_name"]){
                if(e.item["name"] === "application_name"){
                    app.application_name = e.item["value"];
                } else if(e.item["name"] === "clock_frequency"){
                    app.clock_frequency = e.item["value"];
                } else if(e.item["name"] === "bitstream") {
                    app.bitstream = e.item["value"];
                } else if(e.item["name"] === "pl_clocks"){
                    app.pl_clocks[e.item["item_id"]] = e.item["value"];
                } else {
                    app.miscellaneous[e.item["name"]] = e.item["value"];
                }
            } else {
                let val = app.miscellaneous[e.item["name"]];
                delete app.miscellaneous[e.item["name"]];
                app.miscellaneous[e.item["value"]]= val;
            }
        } else {
            let index = app[this.item_types_map[e.object]].findIndex((val:any)=>{
                return val[this.item_id_map[e.object]] == e.item["item_id"];
            });
            if(index >= 0){
                app[this.item_types_map[e.object]][index][e.item['field']] = e.item['value']
            }
        }

        await this.db.applications.update_application_field(app);
    }

    remove_item = async (e: application_edit_model) =>{
        let app = await this.db.applications.get_application(e.application)


        if(e.object === "misc") {
            delete app.miscellaneous[e.item]
        }else if(e.object === "selected_script" || e.object === "selected_program"){

            let index = app[this.item_types_map[e.object]].indexOf(e.item);
            if (index !== -1) {
                app[this.item_types_map[e.object]].splice(index, 1);
            }

        } else {
            let index = app[this.item_types_map[e.object]].findIndex((val:any)=>{
                return val[this.item_id_map[e.object]] == e.item;
            });
            if (index !== -1) {
                app[this.item_types_map[e.object]].splice(index);
            }
        }
        await this.db.applications.update_application_field(app);
    }
}