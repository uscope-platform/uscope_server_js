import hw_interface from "../src/hardware_interface/hw_interface";
import {expect} from "@jest/globals"
import {programs_info} from "../src/data_model/operations_model";

describe('Hardware interface test', () => {

    let hw = new hw_interface("localhost", 6666);


    beforeAll(async () =>{
        await hw.set_scope_address({
            address: 0x443c20000,
            dma_buffer_offset: 1241
        });
    })


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
        let resp = await hw.set_dma_disable(false);
        expect(resp).toBeUndefined();
    });

    test('load bitstream', async () => {
        let resp = await hw.load_bitstream("test_bitstream");
        expect(resp).toBeUndefined();
    });

    test('set channel status', async () => {

        let resp = await hw.set_channel_status( {'0': true, '1': true, '2': true, '3': true, '4': true, '5': true});
        expect(resp).toBeUndefined();
    });

    test('set scaling factors', async () => {

        let resp = await hw.set_scaling_factors([1, 1.5, 2, -5.4, 1, 0]);
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
                controller: 0x443c00000n,
                cores_control: 0x443c10000n,
                cores_inputs: 8192,
                cores_rom:  0x443c20000n,
                hil_control:  0x443c30000n,
                scope_mux:  0x443c40000n
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
        expect(resp).toStrictEqual({hex: [131073, 12, 12, 12, 397345, 12], status: "ok"});
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

});


