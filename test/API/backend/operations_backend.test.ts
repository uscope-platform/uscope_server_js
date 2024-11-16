
import database from "../../../src/Database/Database";
import {expect} from "@jest/globals";
import hw_interface from "../../../src/hardware_interface/hw_interface";
import OperationsBackend from "../../../src/API/backend/operations";
import register_write_model, {
    acquisition_status, clock_info,
    programs_info, scope_address, select_hil_output, set_hil_inputs
} from "../../../src/data_model/operations_model";
import emulator_model, {hil_debug_model} from "../../../src/data_model/emulator_model";
import program_model from "../../../src/data_model/program_model";
import {application_model} from "../../../src/data_model/application_model";
import bitstream_model from "../../../src/data_model/bitstreams_model";


import fs from "node:fs";
import request from "supertest";
import endpoints_map from "../../../src/API/frontend/endpoints_map";

describe('operations backend test', () => {
    let db_call_args = [] as any;
    let db = {
        programs:{
            get_program:(id:number):program_model=>{
                if(id===1){
                    return {
                        id:2,
                        name:"radf",
                        type:"C",
                        hex:[213, 134,2],
                        content:"",
                        headers:[],
                        cached_bin_version:"21324",
                        build_settings:[]
                    };
                } else {
                    return {
                        id:id,
                        name:"radf",
                        type:"C",
                        hex:[21134,2],
                        content:"",
                        headers:[],
                        cached_bin_version:"safaf",
                        build_settings:[]
                    };
                }
            },
            update_program_field: (i:any, n:any, v:any)=>{
                db_call_args.push({id:i, name:n, value:v});
            }
        }
    } as any as database;

    let args = [] as any;

    let hw  =  {
        load_bitstream: (a:any) =>{
            args = a;
            return "ok";
        },
        read_data:()=>{
            return [123, 123, 123];
        },
        read_register:(addr:any) =>{
            args = addr;
            return 1232;
        },
        write_register:(a:any) =>{
            args = a;
            return "ok";
        },

        compile_program:(a:any)=>{
            if(a.id<44){
                args = a;
                return "ok";
            } else if(a.id == 44){
                return {hash:"htrsgv", hex:[1,69,444]}
            } else if(a.id == 66){
                return {status:"error",error:"error test"}
            }
        },
        set_scaling_factors:(a:any)=>{
            args = a;
            return "ok";
        },
        set_channel_status:(a:any)=>{
            args = a;
            return "ok";
        },
        get_acquisition_status:()=>{
            return "wait";
        },
        set_acquisition:(a:any)=>{
            args = a;
            return "ok";
        },
        start_hil:()=>{
            return "ok";
        },
        stop_hil:()=>{
            return "ok";
        },
        set_scope_address:(a:any)=>{
            args = a;
            return "ok";
        },
        set_dma_disable:(a:any)=>{
            args = a;
            return "ok";
        },
        select_output:(a:any)=>{
            args = a;
            return "ok";
        },
        set_input:(a:any)=>{
            args = a;
            return "ok";
        },
        get_version:(a:any)=>{
            args = a;
            return "1234fasf";
        },
        deploy_hil:(a:any)=>{
            args = a;
            return "ok";
        },
        emulate_hil:(a:any)=>{
            args = a;
            return "ok";
        },
        debug_hil:(a:any)=>{
            args = a;
            return {result:"ok"}
        },
        get_clock:(a:any)=>{
            args.push(a);
            return 21342123;
        },
        set_clock:(a:any)=>{
            args = a;
            return "ok";
        },
        apply_program:(h:any, a:any)=>{
            args = {hex:h, addr:a};
            return "ok";
        }
    } as any as hw_interface;

    let backend = new OperationsBackend(db,hw);



    test('load_application_clean', async () => {
        let a : application_model = {
            application_name: "",
            bitstream: "test.bit",
            channel_groups: [],
            channels: [],
            clock_frequency: 0,
            filters: [],
            id: 0,
            initial_registers_values: [],
            macro: [],
            miscellaneous: {},
            parameters: [],
            peripherals: [],
            pl_clocks: {0: 0, 1: 0, 2: 0, 3: 0},
            programs: [],
            scripts: [],
            soft_cores: []

        }
        let b : bitstream_model = {
            data: Buffer.from("t3affa"),
            hash: "",
            id: 0,
            name: ""
        }

        let bitstream = "/tmp/test.bit"
        if(fs.existsSync(bitstream)) fs.unlinkSync(bitstream);
        let res = await backend.load_application(a, b);

        expect(res).toStrictEqual("ok");
        expect(fs.existsSync(bitstream)).toBeTruthy();
        let content = fs.readFileSync(bitstream).toString();
        expect(content).toStrictEqual("t3affa");
        if(fs.existsSync(bitstream)) fs.unlinkSync(bitstream);
    });


    test('load_application_no_refresh', async () => {
        let a : application_model = {
            application_name: "",
            bitstream: "test.bit",
            channel_groups: [],
            channels: [],
            clock_frequency: 0,
            filters: [],
            id: 0,
            initial_registers_values: [],
            macro: [],
            miscellaneous: {},
            parameters: [],
            peripherals: [],
            pl_clocks: {0: 0, 1: 0, 2: 0, 3: 0},
            programs: [],
            scripts: [],
            soft_cores: []

        }
        let b : bitstream_model = {
            data: Buffer.from("t3affa"),
            hash: "5bc0978d11d3a8c01893a0e0b2d40c15081c7c9eb3b6a2e7a84d1babdce76870",
            id: 0,
            name: ""
        }

        let bitstream = "/tmp/test.bit"
        if(fs.existsSync(bitstream)) fs.unlinkSync(bitstream);
        fs.writeFileSync(bitstream, b.data);
        let res = await backend.load_application(a, b);

        expect(res).toStrictEqual("ok");
        expect(fs.existsSync(bitstream)).toBeTruthy();
        let content = fs.readFileSync(bitstream).toString();
        expect(content).toStrictEqual("t3affa");
        if(fs.existsSync(bitstream)) fs.unlinkSync(bitstream);

    });


    test('load_application_refresh', async () => {
        let a : application_model = {
            application_name: "",
            bitstream: "test.bit",
            channel_groups: [],
            channels: [],
            clock_frequency: 0,
            filters: [],
            id: 0,
            initial_registers_values: [],
            macro: [],
            miscellaneous: {},
            parameters: [],
            peripherals: [],
            pl_clocks: {0: 0, 1: 0, 2: 0, 3: 0},
            programs: [],
            scripts: [],
            soft_cores: []

        }
        let b : bitstream_model = {
            data: Buffer.from("t3affa"),
            hash: "",
            id: 0,
            name: ""
        }

        let bitstream = "/tmp/test.bit"
        if(fs.existsSync(bitstream)) fs.unlinkSync(bitstream);
        fs.writeFileSync(bitstream, Buffer.from("test rewrite"));
        let res = await backend.load_application(a, b);

        expect(res).toStrictEqual("ok");
        expect(fs.existsSync(bitstream)).toBeTruthy();
        let content = fs.readFileSync(bitstream).toString();
        expect(content).toStrictEqual("t3affa");
        if(fs.existsSync(bitstream)) fs.unlinkSync(bitstream);
    });

    test('fetch_data', async () => {
        let res =await backend.fetch_data();
        expect(res).toStrictEqual([123, 123, 123]);
    });

    test('read_register', async () => {
        let res =await backend.read_register(12441);
        expect(args).toStrictEqual(12441)
        expect(res).toStrictEqual(1232);
    });

    test('write_register', async () => {
        let a : register_write_model = {
            address:987,
            type:"direct",
            value:324,
            proxy_type:"",
            proxy_address:1
        }

        let res =await backend.write_register(a);
        expect(args).toStrictEqual(a);
        expect(res).toStrictEqual("ok");
    });

    test('compile_program', async () => {
        let a :programs_info = {
            content: "123",
            hash: "sdf",
            type: "C",
            core_address:123,
            headers:[],
            io:[],
            id:1
        }
        let res =await backend.compile_program(a);
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual(a);
    });

    test('set_scaling_factors', async () => {
        let res =await backend.set_scaling_factors([1.0, 0.6, 3.2]);
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual([1.0, 0.6, 3.2]);
    });


    test('set_channel_status', async () => {
        let res =await backend.set_channel_status({"1":true, "2":true, "3":false});
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual({"1":true, "2":true, "3":false});
    });


    test('get_acquisition', async () => {
        let res =await backend.get_acquisition();
        expect(res).toStrictEqual("wait");
    });


    test('set_acquisition', async () => {
        let a : acquisition_status = {
            level:123,
            trigger:"edge",
            mode:"single",
            source:2,
            level_type:"rising",
            trigger_point:213,
            prescaler:1
        };
        let res =await backend.set_acquisition(a);
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual(a);
    });


    test('hil_start', async () => {
        let res =await backend.hil_start();
        expect(res).toStrictEqual("ok");
    });


    test('hil_stop', async () => {
        let res =await backend.hil_stop();
        expect(res).toStrictEqual("ok");
    });

    test('get_version', async () => {
        let res =await backend.get_version("34123");
        expect(res).toStrictEqual("1234fasf");
        expect(args).toStrictEqual("34123");
    });

    test('set_scope_address', async () => {
        let a :scope_address = {
            address: 123,
            dma_buffer_offset:123
        }
        let res =await backend.set_scope_address(a);
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual(a);
    });

    test('set_dma_disable', async () => {
        let res =await backend.set_dma_disable({status:false});
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual({status:false});
    });


    test('hil_select_output', async () => {
        let a :select_hil_output = {
            channel: 1,
            output: {
                address:1,
                channel:2,
                name:"string",
                output:"a",
                source:"b"
            }
        }
        let res =await backend.hil_select_output(a);
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual(a);
    });

    test('hil_set_input', async () => {
        let a :set_hil_inputs = {
            address:[123],
            core:"sad",
            value:32
        }
        let res =await backend.hil_set_input(a);
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual(a);
    });

    test('hil_deploy', async () => {
        let a :emulator_model = {
            id:2,
            name:"ters",
            deployment_mode:false,
            connections:[],
            cores:{},
            emulation_time:231
        }
        let res =await backend.hil_deploy(a);
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual(a);
    });


    test('hil_emulate', async () => {
        let a :emulator_model = {
            id:2,
            name:"ters",
            deployment_mode:false,
            connections:[],
            cores:{},
            emulation_time:231
        }
        let res =await backend.hil_emulate(a);
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual(a);
    });


    test('get_clocks', async () => {
        let res =await backend.get_clocks();
        expect(res).toStrictEqual([21342123, 21342123, 21342123, 21342123]);
        expect(args).toStrictEqual([0,1, 2, 3]);
    });


    test('set_clock', async () => {
        let a : clock_info = {
            id:0,
            value:1234,
            is_primary:false
        }
        let res =await backend.set_clock(a);
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual(a);
    });


    test('apply_cached_program', async () => {
        let a : programs_info = {
            id:1,
            headers:[],
            io:[],
            type:"C",
            core_address:2134,
            hash:"21324",
            content:""
        }
        let res =await backend.apply_program(a);
        expect(res).toStrictEqual("ok");
        expect(args.hex).toStrictEqual([213, 134, 2]);
        expect(args.addr).toStrictEqual(2134);
    });


    test('apply_new_program', async () => {
        let a : programs_info = {
            id:44,
            headers:[],
            io:[],
            type:"C",
            core_address:21134,
            hash:"21324",
            content:""
        }
        await backend.apply_program(a);
        expect(args.hex).toStrictEqual([1, 69, 444]);
        expect(args.addr).toStrictEqual(21134);
        expect(db_call_args[0]).toStrictEqual({id:44, name:"hex", value:[1, 69,444]})
        expect(db_call_args[1]).toStrictEqual({id:44, name:"cached_bin_version", value:"21324"})
    });


    test('apply program compile error', async () => {
        let a : programs_info = {
            id:66,
            headers:[],
            io:[],
            type:"C",
            core_address:21134,
            hash:"21324",
            content:""
        }
        let res =await backend.apply_program(a);
        expect(res).toStrictEqual({error:"error test", status:"failed"});
    });



    test('debug_hil', async () => {

        let a : hil_debug_model = {
            action:"breakpoint",
            arguments:{
                id:"core",
                instruction:32
            }

        };

        let res =await backend.hil_debug(a);
        expect(a).toStrictEqual(args);
        expect(res).toStrictEqual({result:"ok"});
    });

    afterEach(() => {
        args = [] as any;
        db_call_args = [] as any;
    });


});


