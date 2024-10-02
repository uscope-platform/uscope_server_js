import Router from "koa-router";
import database from "../../Database/Database";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";
import OperationsBackend from "../backend/operations";
import register_write_model, {
    acquisition_status,
    channel_statuses, clock_info,
    programs_info, scope_address, select_hil_output, set_hil_inputs, status_object
} from "../../data_model/operations_model";
import emulator_model from "../../data_model/emulator_model";
import FiltersBackend from "../backend/filters";
import {filter_apply_model} from "../../data_model/filters_model";
import {stat} from "node:fs";


class operations_router {
    public router: Router;
    public db: database;
    private ops_backend: OperationsBackend;
    private filter_backend: FiltersBackend;

    constructor(db: database, ops:OperationsBackend, flt:FiltersBackend) {
        this.db = db
        this.ops_backend = ops;
        this.filter_backend = flt;

        this.router = new Router({
            prefix: endpoints_map.operations.prefix
        });


        this.router.get(endpoints_map.operations.endpoints.load_application, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                let app =await this.db.applications.get_application(id);
                if(app.bitstream){
                    let bitstream = await this.db.bitstreams.get_by_path(app.bitstream);
                    if(bitstream === undefined) throw "Bitstream not found (" + app.bitstream+ ")";
                    await this.ops_backend.load_application(app, bitstream);
                }

                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.operations.endpoints.write_registers, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let data = <register_write_model[]>ctx.request.body;
                for(let item of data){
                    await this.ops_backend.write_register(item);
                }
                ctx.status = 200;
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.get(endpoints_map.operations.endpoints.read_register, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let address = parseInt(ctx.params.address);
                ctx.response.status = 200;
                ctx.response.body = await this.ops_backend.read_register(address);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.get(endpoints_map.operations.endpoints.clock, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.response.body = await this.ops_backend.get_clocks();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.operations.endpoints.clock, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let data = <clock_info>ctx.request.body;
                await this.ops_backend.set_clock(data);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.post(endpoints_map.operations.endpoints.compile_program, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let data = <programs_info>ctx.request.body;
                ctx.response.body = await this.ops_backend.compile_program(data);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }

        });

        this.router.post(endpoints_map.operations.endpoints.apply_program, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let data = <programs_info>ctx.request.body;
                ctx.response.body = await this.ops_backend.apply_program(data);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.get(endpoints_map.operations.endpoints.fetch_data, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.response.body = await this.ops_backend.fetch_data();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.post(endpoints_map.operations.endpoints.set_channel_status, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let data = <channel_statuses>ctx.request.body;
                ctx.response.body = await this.ops_backend.set_channel_status(data);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.post(endpoints_map.operations.endpoints.scaling_factors, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let data = <number[]>ctx.request.body;
                ctx.response.body = await this.ops_backend.set_scaling_factors(data);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.get(endpoints_map.operations.endpoints.acquisition, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.response.body = await this.ops_backend.get_acquisition();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.post(endpoints_map.operations.endpoints.acquisition, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let status = <acquisition_status>ctx.request.body;
                ctx.response.body = await this.ops_backend.set_acquisition(status);
                ctx.status = 200;
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        })

        this.router.post(endpoints_map.operations.endpoints.scope_address, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let status = <scope_address>ctx.request.body;
                ctx.response.body = await this.ops_backend.set_scope_address(status);
                ctx.status = 200;
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.post(endpoints_map.operations.endpoints.dma_disable, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let status = <status_object>ctx.request.body;
                ctx.response.body = await this.ops_backend.set_dma_disable(status);
                ctx.status = 200;
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });



        this.router.post(endpoints_map.operations.endpoints.hil_emulate, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let status = <emulator_model>ctx.request.body;
                ctx.response.body = await this.ops_backend.hil_emulate(status);
                ctx.status = 200;
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.post(endpoints_map.operations.endpoints.hil_deploy, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let status = <emulator_model>ctx.request.body;
                ctx.response.body = await this.ops_backend.hil_deploy(status);
                ctx.status = 200;
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.operations.endpoints.hil_set_input, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let status = <set_hil_inputs>ctx.request.body;
                ctx.response.body = await this.ops_backend.hil_set_input(status);
                ctx.status = 200;
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.post(endpoints_map.operations.endpoints.hil_select_output, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let status = <select_hil_output>ctx.request.body;
                ctx.response.body = await this.ops_backend.hil_select_output(status);
                ctx.status = 200;
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });



        this.router.get(endpoints_map.operations.endpoints.hil_start, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.response.body = await this.ops_backend.hil_start();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.get(endpoints_map.operations.endpoints.hil_stop, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                ctx.response.body = await this.ops_backend.hil_stop();
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.get(endpoints_map.operations.endpoints.filter_design, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.response.body = await this.filter_backend.design_filter(id);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.get(endpoints_map.operations.endpoints.filter_implement, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.response.body = await this.filter_backend.implement_filter(id);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.operations.endpoints.filter_apply, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let req = <filter_apply_model>ctx.request.body;
                ctx.response.body = await this.filter_backend.apply_filter(req.id, req.address);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });
    }
}

export default operations_router;

