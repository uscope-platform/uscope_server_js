import Router from "koa-router";
import {database} from "#database";
import * as Koa from "koa";
import {endpoints_map} from ".";
import {
    register_write_model, emulator_model, acquisition_status, channel_statuses, clock_info,
    programs_info, scope_address, select_hil_output, set_hil_inputs, status_object,
    hil_debug_model, filter_apply_model
} from "#models";
import {FiltersBackend, OperationsBackend, http_error} from "#api_backend";

/// The RPU has two cores, 0 and 1
let parse_core = (raw:string) : number => {
    if(raw !== "0" && raw !== "1") throw new http_error(400, "The RPU core must be 0 or 1, got " + raw);
    return parseInt(raw);
}


export class operations_router {
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


        this.router.get(endpoints_map.operations.endpoints.load_application, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            let app =await this.db.applications.get_application(id);
            if(app.bitstream){
                let bitstream = await this.db.bitstreams.get_by_name(app.bitstream);
                if(bitstream === undefined) throw "Bitstream not found (" + app.bitstream+ ")";
                await this.ops_backend.load_application(bitstream);
            }

            ctx.status = 200
        });

        this.router.get(endpoints_map.operations.endpoints.load_bitstream, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            let bitstream = await this.db.bitstreams.get_bitstream(id);
            if(bitstream === undefined) throw "Bitstream not found (" + id+ ")";
            await this.ops_backend.load_application(bitstream);
            ctx.status = 200
        });

        this.router.post(endpoints_map.operations.endpoints.write_registers, async (ctx:Koa.Context) => {
            let data = <register_write_model[]>ctx.request.body;
            for(let item of data){
                await this.ops_backend.write_register(item);
            }
            ctx.status = 200;
        });


        this.router.get(endpoints_map.operations.endpoints.read_register, async (ctx:Koa.Context) => {
            let address = parseInt(ctx.params.address);
            ctx.response.status = 200;
            ctx.response.body = await this.ops_backend.read_register(address);
            ctx.status = 200
        });

        this.router.get(endpoints_map.operations.endpoints.clock, async (ctx:Koa.Context) => {
            ctx.response.body = await this.ops_backend.get_clocks();
            ctx.status = 200
        });


        this.router.post(endpoints_map.operations.endpoints.clock, async (ctx:Koa.Context) => {
            let data = <clock_info>ctx.request.body;
            await this.ops_backend.set_clock(data);
            ctx.status = 200
        });

        this.router.get(endpoints_map.operations.endpoints.rpu_clock, async (ctx:Koa.Context) => {
            ctx.response.body = await this.ops_backend.get_rpu_clock();
            ctx.status = 200
        });


        this.router.post(endpoints_map.operations.endpoints.rpu_clock, async (ctx:Koa.Context) => {
            let data = <{value:number}>ctx.request.body;
            if(typeof data?.value !== "number" || !Number.isInteger(data.value) || data.value <= 0){
                ctx.throw(400, "The RPU clock request must be an object with a positive integer value field (frequency in Hz)");
            }
            await this.ops_backend.set_rpu_clock(data.value);
            ctx.status = 200
        });

        this.router.post(endpoints_map.operations.endpoints.rpu_load, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            let prog = await this.db.rpu_programs.get_rpu_program(id);
            if(prog === undefined) throw new http_error(404, "RPU program not found (" + ctx.params.id + ")");
            await this.ops_backend.rpu_load_program(prog);
            ctx.status = 200
        });

        this.router.post(endpoints_map.operations.endpoints.rpu_stop, async (ctx:Koa.Context) => {
            await this.ops_backend.rpu_stop(parse_core(ctx.params.core));
            ctx.status = 200
        });

        this.router.get(endpoints_map.operations.endpoints.rpu_status, async (ctx:Koa.Context) => {
            ctx.response.body = await this.ops_backend.rpu_status(parse_core(ctx.params.core));
            ctx.status = 200
        });

        this.router.post(endpoints_map.operations.endpoints.compile_program, async (ctx:Koa.Context) => {
            let data = <programs_info>ctx.request.body;
            ctx.response.body = await this.ops_backend.compile_program(data);
            ctx.status = 200

        });

        this.router.post(endpoints_map.operations.endpoints.apply_program, async (ctx:Koa.Context) => {
            let data = <programs_info>ctx.request.body;
            ctx.response.body = await this.ops_backend.apply_program(data);
            ctx.status = 200
        });

        this.router.post(endpoints_map.operations.endpoints.scope_ticket, async (ctx:Koa.Context) => {
            ctx.response.body = await this.ops_backend.create_scope_ticket(ctx.state.user.role);
            ctx.status = 200;
        });

        this.router.post(endpoints_map.operations.endpoints.hil_disassemble, async (ctx:Koa.Context) => {
            let status = <emulator_model>ctx.request.body;
            ctx.response.body = await this.ops_backend.hil_disassemble(status);
            ctx.status = 200;
        });

        this.router.get(endpoints_map.operations.endpoints.sampling_frequency, async (ctx:Koa.Context) => {
            ctx.response.body = await this.ops_backend.get_sampling_frequency();
            ctx.status = 200;
        });

        this.router.post(endpoints_map.operations.endpoints.hil_debug, async (ctx:Koa.Context) => {
            let command = <hil_debug_model>ctx.request.body;
            ctx.response.body = await this.ops_backend.hil_debug(command);
            ctx.status = 200;
        });


        this.router.post(endpoints_map.operations.endpoints.hil_emulate, async (ctx:Koa.Context) => {
            let status = <emulator_model>ctx.request.body;
            ctx.response.body = await this.ops_backend.hil_emulate(status);
            ctx.status = 200;
        });

        this.router.post(endpoints_map.operations.endpoints.hil_deploy, async (ctx:Koa.Context) => {
            let status = <emulator_model>ctx.request.body;
            ctx.response.body = await this.ops_backend.hil_deploy(status);
            ctx.status = 200;
        });

        this.router.post(endpoints_map.operations.endpoints.hil_hardware_sim, async (ctx:Koa.Context) => {
            let model = <emulator_model>ctx.request.body;
            ctx.response.body = await this.ops_backend.hil_hardware_sim(model);
            ctx.status = 200;
        });


        this.router.post(endpoints_map.operations.endpoints.hil_set_input, async (ctx:Koa.Context) => {
            let status = <set_hil_inputs>ctx.request.body;
            ctx.response.body = await this.ops_backend.hil_set_input(status);
            ctx.status = 200;
        });

        this.router.post(endpoints_map.operations.endpoints.hil_select_output, async (ctx:Koa.Context) => {
            let status = <select_hil_output>ctx.request.body;
            ctx.response.body = await this.ops_backend.hil_select_output(status);
            ctx.status = 200;
        });



        this.router.get(endpoints_map.operations.endpoints.hil_target, async (ctx:Koa.Context) => {
            ctx.type = 'text';
            ctx.response.body = await this.ops_backend.get_hil_target();
            ctx.status = 200
        });


        this.router.post(endpoints_map.operations.endpoints.hil_target, async (ctx:Koa.Context) => {
            let req = <any>ctx.request.body;
            await this.ops_backend.set_hil_target(<string>req.target);
            ctx.status = 200
        });


        this.router.get(endpoints_map.operations.endpoints.hil_start, async (ctx:Koa.Context) => {
            ctx.response.body = await this.ops_backend.hil_start();
            ctx.status = 200
        });


        this.router.get(endpoints_map.operations.endpoints.hil_stop, async (ctx:Koa.Context) => {
            ctx.response.body = await this.ops_backend.hil_stop();
            ctx.status = 200
        });


        this.router.get(endpoints_map.operations.endpoints.filter_design, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            ctx.response.body = await this.filter_backend.design_filter(id);
            ctx.status = 200
        });


        this.router.get(endpoints_map.operations.endpoints.filter_implement, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            ctx.response.body = await this.filter_backend.implement_filter(id);
            ctx.status = 200
        });

        this.router.get(endpoints_map.operations.endpoints.filter_response, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            ctx.response.body = await this.filter_backend.get_response(id);
            ctx.status = 200
        });


        this.router.post(endpoints_map.operations.endpoints.filter_apply, async (ctx:Koa.Context) => {
            let req = <filter_apply_model>ctx.request.body;
            ctx.response.body = await this.filter_backend.apply_filter(req.id, req.address);
            ctx.status = 200
        });


    }
}
