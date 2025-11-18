import Koa from "koa";
import bodyParser from "koa-bodyparser";
import jwt from "koa-jwt"
import {operations_router,endpoints_map} from "#api_frontend";
import fs from "node:fs";
import {createHash} from "node:crypto";
import request from "supertest";
import {expect} from "@jest/globals";
import {hw_interface} from "#hw";
import {database} from "#database";
import {FiltersBackend, OperationsBackend, authorizer, error_handler} from "#api_backend";




describe('Operation API tests', () => {


    let data = fs.readFileSync(__dirname + "/../../data/mock.bit");
    let hash = createHash('sha256').update(data).digest('hex');

    const app = new Koa();

    let init_app = {id: 1,
        application_name:'new application_1',
        bitstream:"test_bitstream",
        channels:[],
        channel_groups:[{
            group_name: "test group 1",
            group_id: "test_group_1",
            channels:[],
            default:false
        }],
        clock_frequency:100000000,
        initial_registers_values:[],
        macro:[{
            address:0x213,
            value:0
        }],
        parameters:[],
        peripherals:[],
        soft_cores:[],
        filters:[],
        programs:[],
        scripts:[],
        miscellaneous:{
            test_misc_p:123
        }}

    app.use(bodyParser());
    let results = {app_id:0, bitstream:""};
    let db = {
        applications:{
            get_application:(id:number)=>{
                results.app_id = id;
                return init_app
            }
        },
        bitstreams:{
            get_by_name:(path:string)=>{
                results.bitstream = path;
                return {
                    id:2,
                    path:'test_2',
                    data: data,
                    hash: hash
                }
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())

    let driver_host = "";
    let driver_port = 0;

    let hw = new hw_interface(driver_host, driver_port);
    let flt = new FiltersBackend(db,hw);
    let ops = new OperationsBackend(db, hw);

    let rtr = new operations_router(db,ops, flt);
    app.use(rtr.router.routes());
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3009);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('load_application', async () => {
        let router = rtr as any;
        let mock_results = {app:{}, bit:{data:{}}};
        const spy = jest.spyOn(router.ops_backend, 'load_application').mockImplementation(
            (bit:any) => {
                mock_results.bit = bit;
            });
        let path = endpoints_map.operations.prefix + endpoints_map.operations.endpoints.load_application;
        path = path.replace(":id", "1")
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual( {app_id:1, bitstream:"test_bitstream"})
                expect(spy).toHaveBeenCalledTimes(1);
                expect(data.equals(<Buffer>mock_results.bit.data)).toBeTruthy();
            });
    });

    test('write_register', async () => {
        let write_in = [
        {
            address: 18316660736,
            proxy_address: 0,
            proxy_type: "",
            type: "direct",
            value: 8
        },
        {
            type: "proxied",
            proxy_type: "axis_constant",
            proxy_address: 12341,
            address: 18316525568,
            value: 123
        }
        ]
        let router = rtr as any;
        let mock_results :any[] = [];
        const spy = jest.spyOn(router.ops_backend, 'write_register').mockImplementation(
            (write_op:any) => {
                mock_results.push(write_op);
            });

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.write_registers)
            .set('Authorization', `Bearer ${token}`)
            .send(write_in)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(2);
                expect(mock_results).toStrictEqual(write_in);
            });

    });


    test('read_register', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'read_register').mockImplementation(
            (address:any) : number => {
                result = address
                return 4213;
            });

        let path = endpoints_map.operations.prefix + endpoints_map.operations.endpoints.read_register;
        path = path.replace(":address", "54231231")

        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.text).toStrictEqual("4213");
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(54231231);
            });

    });

    test('compile_program', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'compile_program').mockImplementation(
            (program:any) => {
                result = program
            });

        let prog_info = {
            id:1,
            content: "void main(){\n\n float a;\nfloat b;\n float c = add(a, b);\n}",
            headers: [
                {
                    name: "functions",
                    content: "float add(float in_1, float in_2) { return in_1 + in_2;}"
            }],
            io: [],
            type: "C"
        }
        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.compile_program)
            .set('Authorization', `Bearer ${token}`)
            .send(prog_info)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(prog_info);
            });

    });


    test('apply_program', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'apply_program').mockImplementation(
            (prog:any) => {
                result = prog
            });
        let prog_info = {
            id: 1,
            content: "void main(){\n\n float a;\nfloat b;\n float c = add(a, b);\n}",
            headers: [{
                name: "functions",
                content: "float add(float in_1, float in_2) { return in_1 + in_2;}"
            }],
            io: [{
                address: "3",
                associated_io: "sin_t",
                name: "sin_t",
                type: "output"
            },
            {
                address: "21",
                associated_io: "cos_t",
                name: "cos_t",
                type: "output"
            }],
            type: "C",
            core_address: "0x83c000000",
            hash: "499168ac9423d43da383435da3a0737b09f200b2"
        }
        let path = endpoints_map.operations.prefix + endpoints_map.operations.endpoints.apply_program;
        path.replace(":id", "1")

        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(prog_info)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(prog_info);
            });

    });



    test('fetch_data', async () => {
        let router = rtr as any;
        const spy = jest.spyOn(router.ops_backend, 'fetch_data').mockImplementation(
            () : number[] => {
                return [1.5, 2.0, 3.0, 4.0, 5.0]
            });

        return request(app.callback())
            .get(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.fetch_data)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(response.text).toStrictEqual("[1.5,2,3,4,5]");
            });

    });




    test('set_scaling_factors', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'set_scaling_factors').mockImplementation(
            (sfs:any) => {
                result = sfs
            });

        let sfs = [1, 1.5, 2, -5.4, 1, 0];

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.scaling_factors)
            .set('Authorization', `Bearer ${token}`)
            .send(sfs)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(sfs);
            });

    });

    test('set_channel_statuses', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'set_channel_status').mockImplementation(
            (sfs:any) => {
                result = sfs
            });

        let statuses = {'0': false, '1': true, '2': true, '3': true, '4': true, '5': true};

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.set_channel_status)
            .set('Authorization', `Bearer ${token}`)
            .send(statuses)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(statuses);
            });

    });


    test('get_acquisition', async () => {
        let router = rtr as any;
        const spy = jest.spyOn(router.ops_backend, 'get_acquisition').mockImplementation(
            () : string => {
                return "wait_trigger"
            });

        return request(app.callback())
            .get(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.acquisition)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(response.text).toStrictEqual("wait_trigger");
            });

    });

    test('set_acquisition', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'set_acquisition').mockImplementation(
            (arg:any) => {
                result = arg
            });

        let acq = {
            level: 0,
            level_type: 'int',
            mode: 'continuous',
            prescaler: 0,
            source: 1,
            trigger: 'rising_edge',
            trigger_point: 200
        };

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.acquisition)
            .set('Authorization', `Bearer ${token}`)
            .send(acq)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(acq);
            });

    });

    test('set_dma_disable', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'set_dma_disable').mockImplementation(
            (arg:any) => {
                result = arg
            });

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.dma_disable)
            .set('Authorization', `Bearer ${token}`)
            .send({status:true})
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual({status:true});
            });

    });

    test('address', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'set_scope_address').mockImplementation(
            (arg:any) => {
                result = arg
            });

        let acq = {'address': 18316853248, 'dma_buffer_offset': 520};

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.scope_address)
            .set('Authorization', `Bearer ${token}`)
            .send(acq)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(acq);
            });

    });


    test('disassemble_hil', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'hil_disassemble').mockImplementation(
            (arg:any) => {
                result = arg
            });

        let hil = {
            cores:[
                {
                    channels: 1,
                    deployment: {control_address: 0, has_reciprocal: false, rom_address: 0},
                    id: 'test_producer',
                    input_data: [],
                    inputs: [],
                    memory_init: [
                        {
                            is_output: true,
                            metadata: {signed: false, type: 'float', width: 32},
                            name: 'mem',
                            reg_n: [32],
                            value: [0]
                        }
                    ],
                    options: {comparators: 'full', efi_implementation: 'none'},
                    order: 1,
                    outputs: [
                        {
                            metadata: {signed: false, type: 'float', width: 32},
                            name: 'out',
                            reg_n: [5]
                        }
                    ],
                    program: {
                        content: 'int main(){\n  float mem;\n\n  mem = mem  + 1.0;\n  mem = fti(mem);\n  mem = mem & 0x3ff;\n  mem = itf(mem);\n  \n  float out[2];\n  out[0] = mem + 100.0;\n  out[1] = mem + 1000.0;\n}',
                        headers: []
                    },
                    sampling_frequency: 10000
                },
                {
                    channels: 2,
                    deployment: {control_address: 0, has_reciprocal: false, rom_address: 0},
                    id: 'test_consumer',
                    input_data: [],
                    inputs: [],
                    memory_init: [],
                    options: {comparators: 'full', efi_implementation: 'none'},
                    order: 2,
                    outputs: [
                        {
                            metadata: {signed: false, type: 'float', width: 32},
                            name: 'out',
                            reg_n: [12]
                        }
                    ],
                    program: {
                        content: 'int main(){\n  float input;\n  float out = input*3.5;\n}',
                        headers: []
                    },
                    sampling_frequency: 10000
                }
            ],
            interconnect:[
                {
                    channels: [
                        {
                            destination: {channel: [0], register: [1]},
                            destination_input: 'input',
                            length: 2,
                            name: 'channel',
                            source: {channel: [0], register: [5]},
                            source_output: 'out',
                            type: 'scatter_transfer'
                        }
                    ],
                    destination: 'test_consumer',
                    source: 'test_producer'
                }
            ],
            emulation_time:1,
            deployment_mode:false,
        };

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_disassemble)
            .set('Authorization', `Bearer ${token}`)
            .send(hil)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(hil);
            });

    });

    test('debug_hil', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'hil_debug').mockImplementation(
            (arg:any) => {
                result = arg
            });

        let args = {
            command:"breakpoint",
            arguments:{
                id:"core",
                instruction:32
            }

        };

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_debug)
            .set('Authorization', `Bearer ${token}`)
            .send(args)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(args);
            });

    });


    test('deploy_hil', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'hil_deploy').mockImplementation(
            (arg:any) => {
                result = arg
            });

        let hil = {
            cores:[
                {
                    channels: 1,
                    deployment: {control_address: 0, has_reciprocal: false, rom_address: 0},
                    id: 'test_producer',
                    input_data: [],
                    inputs: [],
                    memory_init: [
                        {
                            is_output: true,
                            metadata: {signed: false, type: 'float', width: 32},
                            name: 'mem',
                            reg_n: [32],
                            value: [0]
                        }
                    ],
                    options: {comparators: 'full', efi_implementation: 'none'},
                    order: 1,
                    outputs: [
                        {
                            metadata: {signed: false, type: 'float', width: 32},
                            name: 'out',
                            reg_n: [5]
                        }
                    ],
                    program: {
                        content: 'int main(){\n  float mem;\n\n  mem = mem  + 1.0;\n  mem = fti(mem);\n  mem = mem & 0x3ff;\n  mem = itf(mem);\n  \n  float out[2];\n  out[0] = mem + 100.0;\n  out[1] = mem + 1000.0;\n}',
                        headers: []
                    },
                    sampling_frequency: 10000
                },
                {
                    channels: 2,
                    deployment: {control_address: 0, has_reciprocal: false, rom_address: 0},
                    id: 'test_consumer',
                    input_data: [],
                    inputs: [],
                    memory_init: [],
                    options: {comparators: 'full', efi_implementation: 'none'},
                    order: 2,
                    outputs: [
                        {
                            metadata: {signed: false, type: 'float', width: 32},
                            name: 'out',
                            reg_n: [12]
                        }
                    ],
                    program: {
                        content: 'int main(){\n  float input;\n  float out = input*3.5;\n}',
                        headers: []
                    },
                    sampling_frequency: 10000
                }
            ],
            interconnect:[
                {
                    channels: [
                        {
                            destination: {channel: [0], register: [1]},
                            destination_input: 'input',
                            length: 2,
                            name: 'channel',
                            source: {channel: [0], register: [5]},
                            source_output: 'out',
                            type: 'scatter_transfer'
                        }
                    ],
                    destination: 'test_consumer',
                    source: 'test_producer'
                }
            ],
            emulation_time:1,
            deployment_mode:false,
        };

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_deploy)
            .set('Authorization', `Bearer ${token}`)
            .send(hil)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(hil);
            });

    });


    test('emulate_hil', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'hil_emulate').mockImplementation(
            (arg:any) => {
                result = arg
            });

        let hil = {
            cores:[
                {
                    channels: 1,
                    deployment: {control_address: 0, has_reciprocal: false, rom_address: 0},
                    id: 'test_producer',
                    input_data: [],
                    inputs: [],
                    memory_init: [
                        {
                            is_output: true,
                            metadata: {signed: false, type: 'float', width: 32},
                            name: 'mem',
                            reg_n: [32],
                            value: [0]
                        }
                    ],
                    options: {comparators: 'full', efi_implementation: 'none'},
                    order: 1,
                    outputs: [
                        {
                            metadata: {signed: false, type: 'float', width: 32},
                            name: 'out',
                            reg_n: [5]
                        }
                    ],
                    program: {
                        content: 'int main(){\n  float mem;\n\n  mem = mem  + 1.0;\n  mem = fti(mem);\n  mem = mem & 0x3ff;\n  mem = itf(mem);\n  \n  float out[2];\n  out[0] = mem + 100.0;\n  out[1] = mem + 1000.0;\n}',
                        headers: []
                    },
                    sampling_frequency: 10000
                },
                {
                    channels: 2,
                    deployment: {control_address: 0, has_reciprocal: false, rom_address: 0},
                    id: 'test_consumer',
                    input_data: [],
                    inputs: [],
                    memory_init: [],
                    options: {comparators: 'full', efi_implementation: 'none'},
                    order: 2,
                    outputs: [
                        {
                            metadata: {signed: false, type: 'float', width: 32},
                            name: 'out',
                            reg_n: [12]
                        }
                    ],
                    program: {
                        content: 'int main(){\n  float input;\n  float out = input*3.5;\n}',
                        headers: []
                    },
                    sampling_frequency: 10000
                }
            ],
            interconnect:[
                {
                    channels: [
                        {
                            destination: {channel: [0], register: [1]},
                            destination_input: 'input',
                            length: 2,
                            name: 'channel',
                            source: {channel: [0], register: [5]},
                            source_output: 'out',
                            type: 'scatter_transfer'
                        }
                    ],
                    destination: 'test_consumer',
                    source: 'test_producer'
                }
            ],
            emulation_time:1,
            deployment_mode:false,
        };

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_emulate)
            .set('Authorization', `Bearer ${token}`)
            .send(hil)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(hil);
            });

    });

    test('hil_select_output', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'hil_select_output').mockImplementation(
            (arg:any) => {
                result = arg
            });

        let  in_obj = {'address': [1], 'core': 'DAB', 'value': 1205};

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_select_output)
            .set('Authorization', `Bearer ${token}`)
            .send(in_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(in_obj);
            });

    });

    test('hil_set_input', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'hil_set_input').mockImplementation(
            (arg:any) => {
                result = arg
            });

        let  in_obj ={'channel': 0, 'output': {'address': 41, 'channel': 0, 'name': 'VSI.v_out(1,0)', 'output': 'v_out', 'source': 'VSI'}};

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_set_input)
            .set('Authorization', `Bearer ${token}`)
            .send(in_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(in_obj);
            });

    });

    test('start_hil', async () => {
        let router = rtr as any;
        const spy = jest.spyOn(router.ops_backend, 'hil_start').mockImplementation(
            () : string => {
                return "wait_trigger"
            });

        return request(app.callback())
            .get(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_start)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
            });

    });

    test('stop_hil', async () => {
        let router = rtr as any;
        const spy = jest.spyOn(router.ops_backend, 'hil_stop').mockImplementation(
            () : string => {
                return "wait_trigger"
            });

        return request(app.callback())
            .get(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_stop)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
            });

    });



    test('get_clocks', async () => {
        let router = rtr as any;
        const spy = jest.spyOn(router.ops_backend, 'get_clocks').mockImplementation(
            () : number[] => {
                return [1999.1, 0, 123, 45]
            });

        return request(app.callback())
            .get(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.clock)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(response.text).toStrictEqual("[1999.1,0,123,45]");
            });

    });


    test('set_clocks', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.ops_backend, 'set_clock').mockImplementation(
            (arg:any) => {
                result = arg
            });

        let clk_obj = {id:"test", value:1293.13, is_primary:false}

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.clock)
            .set('Authorization', `Bearer ${token}`)
            .send(clk_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(clk_obj);
            });

    });



    test('design_filter', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.filter_backend, 'design_filter').mockImplementation(
            (arg:any) => {
                result = arg
            });
        let path = endpoints_map.operations.prefix + endpoints_map.operations.endpoints.filter_design;
        path = path.replace(":id", "4")
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(4);
            });

    });

    test('implement_filter', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.filter_backend, 'implement_filter').mockImplementation(
            (arg:any) => {
                result = arg
            });

        let path = endpoints_map.operations.prefix + endpoints_map.operations.endpoints.filter_implement;
        path = path.replace(":id", "23")

        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(23);
            });

    });

    test('get_response', async () => {
        let router = rtr as any;
        let result = 0;
        const spy = jest.spyOn(router.filter_backend, 'get_response').mockImplementation(
            (arg:any) => {
                result = arg
            });

        let path = endpoints_map.operations.prefix + endpoints_map.operations.endpoints.filter_response;
        path = path.replace(":id", "23")

        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(23);
            });

    });


    test('apply_filter', async () => {
        let router = rtr as any;
        let result = {} as any;
        const spy = jest.spyOn(router.filter_backend, 'apply_filter').mockImplementation(
            (id:any, addr:any) => {
                result ={i:id, a:addr}
            });


        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.filter_apply)
            .set('Authorization', `Bearer ${token}`)
            .send({id:2, address:3123})
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result.i).toStrictEqual(2);
                expect(result.a).toStrictEqual(3123);
            });

    });


    test('hil_hardware_sim', async () => {
        let router = rtr as any;
        let result = {} as any;
        const spy = jest.spyOn(router.ops_backend, 'hil_hardware_sim').mockImplementation(
            (model:any) => {
                result =model
            });

        let model = {cores:[], version:1,interconnects:[]};

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_hardware_sim)
            .set('Authorization', `Bearer ${token}`)
            .send(model)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(model);
            });

    });


    test('sampling_frequency', async () => {
        let router = rtr as any;
        const spy = jest.spyOn(router.ops_backend, 'get_sampling_frequency').mockImplementation(
            () => {
               return 5423;
            });
        return request(app.callback())
            .get(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.sampling_frequency)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toHaveBeenCalledTimes(1);
            });

    });

    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });


    afterAll(() => server.close());
});
