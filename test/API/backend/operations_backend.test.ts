
import {database} from "#database";
import {expect} from "@jest/globals";
import {hw_interface} from "#hw";
import {OperationsBackend} from "#api_backend";
import {
    register_write_model, clock_info,
    programs_info, select_hil_output, set_hil_inputs,
    emulator_model, hil_debug_model, program_model, bitstream_model,
} from "#models";


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
                        cached_bin_version:"21324"
                    };
                } else {
                    return {
                        id:id,
                        name:"radf",
                        type:"C",
                        hex:[21134,2],
                        content:"",
                        headers:[],
                        cached_bin_version:"safaf"
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
        read_register:(addr:any) =>{
            args = addr;
            return 1232;
        },
        write_register:(a:any) =>{
            args = a;
            return "ok";
        },
        get_sampling_frequency:() =>{
          return 1234;
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
        add_scope_ticket:(ticket:any, role:any, ttl:any)=>{
            args = {ticket, role, ttl};
            return undefined;
        },
        start_hil:()=>{
            return "ok";
        },
        stop_hil:()=>{
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



    test('load_application', async () => {
        let b : bitstream_model = {
            data: Buffer.from("t3affa"),
            hash: "",
            id: 0,
            name: ""
        }

        let res = await backend.load_application(b);

        expect(res).toStrictEqual("ok");
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





    test('create_scope_ticket', async () => {
        let res = await backend.create_scope_ticket("operator");
        expect(res.ttl).toBe(60);
        expect(res.ticket).toMatch(/^[0-9a-f]{64}$/);
        expect(args).toStrictEqual({ticket: res.ticket, role: "operator", ttl: 60});
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


    test('hil_select_output', async () => {
        let a :select_hil_output = {
            channel: 1,
            output: {
                channel:2,
                core:"Core",
                name:"string"
            }
        }
        let res =await backend.hil_select_output(a);
        expect(res).toStrictEqual("ok");
        expect(args).toStrictEqual(a);
    });

    test('hil_set_input', async () => {
        let a :set_hil_inputs = {
            core:"sad",
            channel: 0,
            name: "string",
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
        let res =await backend.get_sampling_frequency();
        expect(res).toStrictEqual(1234);
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


