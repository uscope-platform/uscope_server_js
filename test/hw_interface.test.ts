import {hw_interface} from "#hw";
import {expect} from "@jest/globals"
import {programs_info, select_hil_output, set_hil_inputs} from "#models";

describe('Hardware interface test', () => {

    let hw = new hw_interface("localhost", 6666);


    beforeAll(async () =>{
        await hw.set_scope_address({
            address: (0x443c20000),
            dma_buffer_offset: 1241
        });
    })

    afterAll(async () =>{
        await hw.close();
    })

    test('set scaling factors', async () => {

        let resp = await hw.set_scaling_factors([1, 1.5, 2, -5.4, 1, 0]);
        expect(resp).toBeUndefined();
    });

    test('set channel status', async () => {

        let resp = await hw.set_channel_status( {'0': true, '1': true, '2': true, '3': true, '4': true, '5': true});
        expect(resp).toBeUndefined();
    });

    test('read_data', async () => {
        let resp = await hw.read_data();
        expect(resp).toHaveLength(6)
        for(let ch of resp){
            expect(ch.channel).toBeLessThanOrEqual(6);
            expect(ch.channel).toBeGreaterThanOrEqual(0);
            expect(ch.data).toHaveLength(1024);
        }
    });



    test('get version', async () => {
        let resp = await hw.get_version("driver");
        expect(typeof resp).toBe('string')
        expect(resp).toHaveLength(7);
    });


    test('set debugger option', async () => {
        let resp = await hw.set_debugger_option({name:"multichannel_debug", value:true});
        expect(resp).toBeUndefined();
    });

    test('get debugger option', async () => {
        let resp = await hw.get_debugger_option("multichannel_debug");
        expect(resp).toBeTruthy();
    });


    test('get debug level', async () => {
        let resp = await hw.get_debug_level();
        expect(resp).toStrictEqual("debug")
    });

    test('set debug level', async () => {
        let resp = await hw.set_debug_level("debug");
        expect(resp).toBeUndefined();
    });


    test('set scope address', async () => {
        let resp = await hw.set_scope_address({
            address: 0x443c20000,
            dma_buffer_offset: 1241
        });
        expect(resp).toBeUndefined();
    });


    test('get acquisition status', async () => {
        let resp = await hw.get_acquisition_status();
        expect(resp).toStrictEqual("unknown");
    });

    test('set dma disable', async () => {
        let resp = await hw.set_dma_disable({status:false});
        expect(resp).toBeUndefined();
    });

    test('load bitstream', async () => {
        let resp = await hw.load_bitstream("test_bitstream");
        expect(resp).toBeUndefined();
    });


    test('read register', async () => {

        let resp = await hw.read_register(0x443c00200);
        expect(typeof resp).toBe('number');
    });


    test('write register', async () => {
        let reg =  {
            address: 0x443c00000,
            proxy_address: 0,
            proxy_type: "",
            type: "direct",
            value: 8123
        };
        let resp = await hw.write_register(reg);
        expect(resp).toBeUndefined();
    });

    test('set hil address map', async () => {

        let a_map = {
            bases: {
                controller: 0x443c00000,
                cores_control: 0x443c10000,
                cores_inputs: 8192,
                cores_rom:  0x443c20000,
                noise_generator:   0x443c70000,
                hil_control:  0x443c30000,
                scope_mux:  0x443c40000
            },
            offsets: {
                controller: 4096,
                cores_control: 65536,
                cores_inputs: 4096,
                cores_rom: 268435456,
                dma: 4096,
                hil_tb: 0
            }
        };

        let resp = await hw.set_hil_address_map(a_map);
        expect(resp).toBeUndefined();
    });

    test('get hil address map', async () => {

        let a_map = {
            bases: {
                controller: 0x443c00000,
                cores_control: 0x443c10000,
                cores_inputs: 8192,
                cores_rom:  0x443c20000,
                hil_control:  0x443c30000,
                scope_mux:  0x443c40000
            },
            offsets: {
                controller: 4096,
                cores_control: 65536,
                cores_inputs: 4096,
                cores_rom: 268435456,
                dma: 4096,
                hil_tb: 0
            }
        };

        let resp = await hw.get_hil_address_map();
        expect(resp).toStrictEqual(a_map);
    });

    test('start hil', async () => {
        let resp = await hw.start_hil();
        expect(resp).toBeUndefined();
    });

    test('stop hil', async () => {
        let resp = await hw.stop_hil();
        expect(resp).toBeUndefined();
    });

    test('set clock', async () => {
        let resp = await hw.set_clock({
            id:0,
            value:126000000,
            is_primary:true
        });
        expect(resp).toBeUndefined();
    });

    test('get clock', async () => {
        let resp = await hw.get_clock(0, true);
        expect(resp).toBe(126000000);
    });


    test('compile program success', async () => {
        let prog :programs_info= {
            id:1,
            headers:[],
            type:"C",
            core_address:0x443c00000,
            hash:"21324",
            content:"void main(){float a; float b; float c; c = a+b;}",
            io:[
                {name:"a",associated_io:"a", address:1, type:"input", common_io:false},
                {name:"b",associated_io:"b", address:2, type:"input", common_io:false},
                {name:"c",associated_io:"c", address:3, type:"output", common_io:false},
            ]
        }

        let resp = await hw.compile_program(prog);
        expect(resp).toStrictEqual({hex: [131076, 12,131073, 65538,196611, 12, 12, 395329, 12], status: "ok"});
    });

    test('compile program error', async () => {
        let prog :programs_info= {
            id:1,
            headers:[],
            type:"C",
            core_address:0x443c00000,
            hash:"21324",
            content:"void main(){float a; float b; float c; casde = a+2ab;}",
            io:[
                {name:"a",associated_io:"a", address:1, type:"input", common_io:false},
                {name:"b",associated_io:"b", address:2, type:"input", common_io:false},
                {name:"c",associated_io:"c", address:3, type:"output", common_io:false},
            ]
        }
        let resp = await hw.compile_program(prog);
        expect(resp).toStrictEqual({
            error: "extraneous input 'ab' expecting ';'",
            status: "error"
        });
    });



    test('apply program', async () => {
        let resp = await hw.apply_program([131073, 12, 12, 12, 397345, 12], 0x500000000);
        expect(resp).toBeUndefined();
    });


    test('apply program', async () => {
        let acq = {
            level: 0,
            level_type: 'int',
            mode: 'continuous',
            prescaler: 0,
            source: 1,
            trigger: 'rising_edge',
            trigger_point: 200
        };

        let resp = await hw.set_acquisition(acq);
        expect(resp).toBeUndefined();
    });

    test('deploy_hil', async () => {
        let hil = {
            version:2,
            cores: [
                {
                    id: "test",
                    order: 1,
                    inputs: [],
                    outputs: [
                        {
                            name: "out",
                            metadata:{
                                type: "float",
                                width:32,
                                signed:true,
                                common_io:false
                            },
                            is_vector: false,
                            vector_size: 1
                        }
                    ],
                    memory_init: [
                        {
                            name: "mem",
                            metadata:{
                                type: "float",
                                width:32,
                                signed:true,
                                common_io:false
                            },
                            is_output: true,
                            is_input: false,
                            is_vector: false,
                            vector_size: 1,
                            value: 14
                        },
                        {
                            name: "mem_2",
                            metadata:{
                                type: "integer",
                                width:16,
                                signed:true
                            },
                            is_output: true,
                            is_input: false,
                            is_vector: false,
                            vector_size: 1,
                            value: 12
                        }
                    ],
                    channels: 1,
                    options: {
                        comparators: "reducing",
                        efi_implementation: "none"
                    },
                    program: {
                        content: "int main(){\n  float mem;\n  float mem_2;\n  float out = mem + mem_2;\n}",
                        headers: []
                    },
                    sampling_frequency: 1,
                    deployment: {
                        has_reciprocal: false,
                        control_address: 18316525568,
                        rom_address: 17179869184
                    }
                }
            ],
            interconnect: [],
            emulation_time: 2,
            deployment_mode: false
        }


        await hw.set_hil_address_map({
            bases: {
                controller: 0x443c00000,
                cores_control: 0x443c10000,
                noise_generator:    0x443c70000,
                cores_inputs: 8192,
                cores_rom:  0x4443c20000,
                hil_control:  0x443c30000,
                scope_mux:  0x443c40000
            },
            offsets: {
                controller: 4096,
                cores_control: 65536,
                cores_inputs: 4096,
                cores_rom: 268435456,
                dma: 4096,
                hil_tb: 0
            }
        });
        let resp = await hw.deploy_hil(hil);
        expect(resp).toBeUndefined();
    });

    test('disassemble hil', async () => {
        let hil = {
            version:2,
            cores: [
                {
                    id: "test",
                    order: 1,
                    inputs: [],
                    outputs: [
                        {
                            name: "out",
                            metadata:{
                                type: "float",
                                width:32,
                                signed:true,
                                common_io:false
                            },
                            is_vector: false,
                            vector_size: 1,
                        }
                    ],
                    memory_init: [
                        {
                            name: "mem",
                            metadata:{
                                type: "float",
                                width:32,
                                signed:true,
                                common_io:false
                            },
                            is_vector: false,
                            vector_size: 1,
                            is_output: true,
                            is_input: false,
                            value: 14
                        },
                        {
                            name: "mem_2",
                            metadata:{
                                type: "integer",
                                width:16,
                                signed:true,
                                common_io: false
                            },
                            is_vector: false,
                            vector_size: 1,
                            is_output: true,
                            is_input: false,
                            value: 12
                        }
                    ],
                    channels: 1,
                    options: {
                        comparators: "reducing",
                        efi_implementation: "none"
                    },
                    program: {
                        content: "int main(){\n  float mem;\n  float mem_2;\n  float out = mem + mem_2;\n}",
                        headers: []
                    },
                    sampling_frequency: 1,
                    deployment: {
                        has_reciprocal: false,
                        control_address: 18316525568,
                        rom_address: 17179869184
                    }
                }
            ],
            interconnect: [],
            emulation_time: 2,
            deployment_mode: false
        }


        let resp = await hw.hil_disassemble(hil);
        expect(resp).toStrictEqual({
            "test": {
                "program": "add r63, r62, r1\nstop\n",
                "translation_table": [
                    [3, 1],
                    [2, 63],
                    [1, 62]
                ]
            }
        });
    });


    test('emulate hil ', async () => {
        let hil = {
            version:2,
            cores: [
                {
                    id: "test",
                    order: 1,
                    inputs: [],
                    outputs: [
                        {
                            name: "out",
                            metadata:{
                                type: "float",
                                width:32,
                                signed:true,
                                common_io:false
                            },
                            is_vector: false,
                            vector_size: 1,
                        }
                    ],
                    memory_init: [
                        {
                            name: "mem",
                            metadata:{
                                type: "float",
                                width:32,
                                signed:true,
                                common_io:false
                            },
                            is_output: true,
                            is_input: false,
                            is_vector: false,
                            vector_size: 1,
                            value: 14
                        },
                        {
                            name: "mem_2",
                            metadata:{
                                type: "float",
                                width:16,
                                signed:true
                            },
                            is_output: true,
                            is_input: false,
                            is_vector: false,
                            vector_size: 1,
                            value: 12.0
                        }
                    ],
                    channels: 1,
                    options: {
                        comparators: "reducing",
                        efi_implementation: "none"
                    },
                    program: {
                        content: "int main(){\n  float mem;\n  float mem_2;\n  float out = mem + mem_2;\n}",
                        headers: []
                    },
                    sampling_frequency: 1,
                    deployment: {
                        has_reciprocal: false,
                        control_address: 18316525568,
                        rom_address: 17179869184
                    }
                }
            ],
            interconnect: [],
            emulation_time: 2,
            deployment_mode: false
        }


        let resp = await hw.emulate_hil(hil);
        expect(resp).toStrictEqual({
            code: 1,
            duplicates: "",
            results: "{\"test\":{\"error_code\":\"\",\"outputs\":{\"mem\":{\"0\":[[14.0,14.0]]},\"mem_2\":{\"0\":[[12.0,12.0]]},\"out\":{\"0\":[[26.0,26.0]]}}},\"timebase\":[0.0]}",
            results_valid: true
        });
    });

    test('select output', async () => {
        let out: select_hil_output = {
            channel: 1,
            output: {
                address:3,
                name:"out",
                output:"out",
                channel:0,
                source:"test"
            }
        };

        let resp = await hw.select_output(out);
        expect(resp).toBeUndefined();
    });

    test('set_input', async () => {
        let i :set_hil_inputs= {
            address:[2],
            core:"test",
            value:23414
        };

        let resp = await hw.set_input(i);
        expect(resp).toBeUndefined();
    });



    test('debug_hil', async () => {

        let args = {
            command:"test",
            arguments:{
                id:"core",
                instruction:32
            }

        };

        let resp = await hw.debug_hil(args);
        expect(resp).toStrictEqual("success");

    });

    test('apply_filter', async () => {

        let resp = await hw.apply_filter([12341,1234,1234], 0x443c00000);
        expect(resp).toBeUndefined();
    });

    test('hil hardware sim', async () => {
        let hil = {
            version:2,
            cores: [
                {
                    id: "test",
                    order: 0,
                    inputs: [
                        {
                            name: "input_1",
                            is_vector: false,
                            metadata:{
                                type: "float",
                                width:16,
                                signed:true,
                                common_io:false
                            },
                            source: {
                                type: "constant",
                                value: [
                                    31.2
                                ]
                            }
                        },
                        {
                            name: "input_2",
                            is_vector: false,
                            metadata:{
                                type: "float",
                                width:16,
                                signed:true,
                                common_io:false
                            },
                            source: {
                                type: "constant",
                                value: [
                                    4
                                ]
                            }
                        }
                    ],
                    outputs: [
                        {
                            name: "out",
                            is_vector: false,
                            metadata:{
                                type: "float",
                                width:16,
                                signed:true,
                                common_io:false
                            }
                        }
                    ],
                    memory_init: [],
                    channels: 1,
                    options: {
                        comparators: "reducing",
                        efi_implementation: "none"
                    },
                    program: {
                        content: "int main(){\n  float input_1;\n  float input_2;\n  float out = input_1 + input_2;\n}",
                        headers: []
                    },
                    sampling_frequency: 1,
                    deployment: {
                        has_reciprocal: false,
                        control_address: 18316525568,
                        rom_address: 17179869184
                    }
                }
            ],
            interconnect: [],
            emulation_time: 2,
            deployment_mode: false
        }


        let resp = await hw.hil_hardware_sim(hil);
        expect(resp).toStrictEqual({
            "code": "293194563584:131076\n293194563588:12\n293194563592:196609\n293194563596:65538\n293194563600:131075\n293194563604:12\n293194563608:12\n293194563612:395329\n293194563616:12\n",
            "control": "18316595204:131073\n18316595268:56\n18316595200:1\n18316599308:0\n18316599304:3\n18316599296:1106876826\n18316599308:1\n18316599304:2\n18316599296:1082130432\n18316529668:0\n18316525576:2\n18316525572:1000000000\n18316529664:1\n18316591104:11\n18316722176:1\n--\n2:test.out\n4:test.out\n5:test.mem\n6:test.mem_2\n"
        });
    });

});


