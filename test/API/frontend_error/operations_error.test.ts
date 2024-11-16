import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../../src/Database/Database";
import {authorizer, error_handler} from "../../../src/API/backend/middleware";
import jwt from "koa-jwt"
import operations_router from "../../../src/API/frontend/operations_api";
import fs from "node:fs";
import {createHash} from "node:crypto";
import request from "supertest";
import {expect} from "@jest/globals";
import OperationsBackend from "../../../src/API/backend/operations";
import FiltersBackend from "../../../src/API/backend/filters";
import endpoints_map from "../../../src/API/frontend/endpoints_map";



describe('Operation API Error handling tests', () => {


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


    let ops = {

        load_application: () =>{
            throw "ops error 0"
        },
        fetch_data: () =>{
            throw "ops error 1"
        },
        read_register: () =>{
            throw "ops error 2"
        },
        write_register: () =>{
            throw "ops error 3"
        },
        compile_program: () =>{
            throw "ops error 4"
        },
        set_scaling_factors: () =>{
            throw "ops error 5"
        },
        set_channel_status: () =>{
            throw "ops error 6"
        },
        get_acquisition: () =>{
            throw "ops error 7"
        },
        set_acquisition: () =>{
            throw "ops error 8"
        },
        set_scope_address: () =>{
            throw "ops error 9"
        },
        set_dma_disable: () =>{
            throw "ops error 10"
        },
        hil_select_output: () =>{
            throw "ops error 11"
        },
        hil_set_input: () =>{
            throw "ops error 12"
        },
        hil_start: () =>{
            throw "ops error 13"
        },
        hil_stop: () =>{
            throw "ops error 14"
        },
        hil_deploy: () =>{
            throw "ops error 15"
        },
        get_version: () =>{
            throw "ops error 16"
        },
        hil_emulate: () =>{
            throw "ops error 17"
        },
        get_clocks: () =>{
            throw "ops error 18"
        },
        set_clock: () =>{
            throw "ops error 19"
        },
        apply_program: () =>{
            throw "ops error 20"
        },
        hil_debug:() =>{
            throw "ops error 21"
        }

    } as any as OperationsBackend;

    let flt = {
        design_filter: () =>{
        throw "flt error 0"
        },
        implement_filter: () =>{
        throw "flt error 1"
        },
        apply_filter: () =>{
            throw "flt error 2"
        }
    } as any as FiltersBackend;

    let rtr = new operations_router(db,ops, flt);
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3009);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('load_application', async () => {

        let path = endpoints_map.operations.prefix + endpoints_map.operations.endpoints.load_application;
        path = path.replace(":id", "1");
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("ops error 0");
            });
    });

    test('read_register', async () => {
        let path = endpoints_map.operations.prefix + endpoints_map.operations.endpoints.read_register;
        path = path.replace(":address", "54231231");
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 2");
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
        return request(app.callback())
            .post( endpoints_map.operations.prefix + endpoints_map.operations.endpoints.write_registers)
            .set('Authorization', `Bearer ${token}`)
            .send(write_in)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 3");
            });

    });


    test('compile_program', async () => {
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
            .post( endpoints_map.operations.prefix + endpoints_map.operations.endpoints.compile_program)
            .set('Authorization', `Bearer ${token}`)
            .send(prog_info)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 4");
            });

    });


    test('apply_program', async () => {
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
        path = path.replace(":id", "1");
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(prog_info)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 20");
            });

    });



    test('fetch_data', async () => {

        return request(app.callback())
            .get(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.fetch_data)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 1");
            });

    });




    test('set_scaling_factors', async () => {

        let sfs = [1, 1.5, 2, -5.4, 1, 0];

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.scaling_factors)
            .set('Authorization', `Bearer ${token}`)
            .send(sfs)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 5");
            });

    });

    test('set_channel_statuses', async () => {

        let statuses = {'0': false, '1': true, '2': true, '3': true, '4': true, '5': true};

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.set_channel_status)
            .set('Authorization', `Bearer ${token}`)
            .send(statuses)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 6");
            });

    });


    test('get_acquisition', async () => {

        return request(app.callback())
            .get(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.acquisition)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 7");
            });

    });

    test('set_acquisition', async () => {

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
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 8");
            });

    });

    test('set_dma_disable', async () => {

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.dma_disable)
            .set('Authorization', `Bearer ${token}`)
            .send({status:true})
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 10");
            });

    });

    test('address', async () => {
        let acq = {'address': 18316853248, 'dma_buffer_offset': 520};

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.scope_address)
            .set('Authorization', `Bearer ${token}`)
            .send(acq)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 9");
            });

    });

    test('deploy_hil', async () => {
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
                        build_settings: {
                            io: {
                                inputs: [],
                                memories: ['mem'],
                                outputs: ['out']
                            }
                        },
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
                        build_settings: {
                            io: {
                                inputs: ['input'],
                                memories: [],
                                outputs: ['out']
                            }
                        },
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
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 15");
            });

    });


    test('emulate_hil', async () => {
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
                        build_settings: {
                            io: {
                                inputs: [],
                                memories: ['mem'],
                                outputs: ['out']
                            }
                        },
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
                        build_settings: {
                            io: {
                                inputs: ['input'],
                                memories: [],
                                outputs: ['out']
                            }
                        },
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
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 17");
            });

    });

    test('hil_select_output', async () => {

        let  in_obj = {'address': [1], 'core': 'DAB', 'value': 1205};

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_select_output)
            .set('Authorization', `Bearer ${token}`)
            .send(in_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 11");
            });

    });

    test('hil_set_input', async () => {
        let  in_obj ={'channel': 0, 'output': {'address': 41, 'channel': 0, 'name': 'VSI.v_out(1,0)', 'output': 'v_out', 'source': 'VSI'}};

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_set_input)
            .set('Authorization', `Bearer ${token}`)
            .send(in_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("ops error 12");
            });

    });

    test('start_hil', async () => {


        return request(app.callback())
            .get(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_start)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("ops error 13");
            });

    });

    test('stop_hil', async () => {


        return request(app.callback())
            .get(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.hil_stop)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("ops error 14");
            });

    });



    test('get_clocks', async () => {

        return request(app.callback())
            .get(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.clock)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("ops error 18");
            });

    });


    test('set_clocks', async () => {

        let clk_obj = {id:"test", value:1293.13, is_primary:false}

        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.clock)
            .set('Authorization', `Bearer ${token}`)
            .send(clk_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("ops error 19");
            });

    });



    test('design_filter', async () => {
        let path = endpoints_map.operations.prefix + endpoints_map.operations.endpoints.filter_design
        path = path.replace(":id", '4')
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("flt error 0");
            });

    });

    test('implement_filter', async () => {
        let path = endpoints_map.operations.prefix + endpoints_map.operations.endpoints.filter_implement
        path = path.replace(":id", '23')
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("flt error 1");
            });

    });

    test('apply_filter', async () => {
        return request(app.callback())
            .post(endpoints_map.operations.prefix + endpoints_map.operations.endpoints.filter_apply)
            .set('Authorization', `Bearer ${token}`)
            .send({id:4, addr:1324})
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("flt error 2");
            });

    });


    test('debug_hil', async () => {


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
                expect(response.status).toBe(501);
                expect(response.text).toBe("ops error 21");
            });

    });



    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });


    afterAll(() => server.close());
});
