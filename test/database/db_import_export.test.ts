import {database} from "#database";
import {expect} from "@jest/globals";
import {
    emulator_model, application_model, filter_model, bitstream_model,
    script_model, program_model, peripheral_model
} from "#models";



describe('emulator_database_tests', () => {

    let bit: bitstream_model = {
        id:2,
        name:'test_2',
        data: Buffer.from("adfeaf"),
        hash: "7588160db403c04aa2dd5a8fa36f799e6d9860040ea0b4c95624d9ef7526c56f"
    }
    let flt: filter_model = {
        id: 1,
        name:"test_fltr",
        parameters:{},
        ideal_taps:[1, 2, 3],
        quantized_taps:[4, 5, 6]
    }

    let emu: emulator_model = {
        id:1,
        name:'new new emulator',
        emulation_time:100.5,
        cores:{},
        connections:[],
        deployment_mode:false,
    }

    let app : application_model = {
        id: 1,
        application_name:'new application_7',
        bitstream:"",
        channels:[],
        channel_groups:[],
        clock_frequency:0,
        initial_registers_values:[],
        macro:[],
        parameters:[],
        peripherals:[],
        soft_cores:[],
        filters:[],
        programs:[],
        scripts:[],
        miscellaneous:{},
        pl_clocks:{
            "0":140e6,
            "1":130e6,
            "2":120e6,
            "3":110e6
        }
    }

    let scr : script_model = {
        id: 2,
        name: "test_script_54",
        path:"",
        content:"cons",
        triggers:"trogger"
    }

    let prg : program_model = {
        id:2,
        name:'test.c',
        content:'',
        type:'',
        build_settings:{
            io:{
                inputs: ["in"],
                outputs: ["out"],
                memories: []
            }
        },
        hex:[213, 1245, 1237546],
        headers:[],
        cached_bin_version:""
    }
    let per : peripheral_model =  {
        id:77,
        name:'new peripheral_7',
        image:"",
        parametric:true,
        registers:[],
        version:"saf"
    }
    let db = new database("localhost", "uscope", "test", "test_schema")


    test('dump', async () => {

        await db.init_db()

        await db.emulators.add_emulator(emu);
        await db.applications.add_application(app);
        await db.filters.add_filter(flt);
        await db.bitstreams.add_bitstream(bit);
        await db.scripts.add_script(scr);
        await db.programs.add_program(prg);
        await db.peripherals.add_peripheral(per)

        let dump = await db.dump();

        expect(dump).toStrictEqual({
            applications: [app],
            filters: [flt],
            scripts: [scr],
            programs: [prg],
            peripherals: [per],
            emulators: [emu],
            bitstreams: [bit]
        });
        await db.delete_database();
    });

    test('restore', async () => {
        await db.init_db();
        await db.restore({
            applications: [app],
            filters: [flt],
            scripts: [scr],
            programs: [prg],
            peripherals: [per],
            emulators: [emu],
            bitstreams: [bit]
        })
        let ret_app = await db.applications.load_all();
        expect(ret_app).toStrictEqual([app]);

        let ret_flt = await db.filters.load_all();
        expect(ret_flt).toStrictEqual([flt]);

        let ret_scr =await db.scripts.load_all();
        expect(ret_scr).toStrictEqual([scr]);

        let ret_prg = await db.programs.load_all();
        expect(ret_prg).toStrictEqual([prg]);

        let ret_per =await db.peripherals.load_all();
        expect(ret_per).toStrictEqual([per]);

        let ret_emu =await db.emulators.load_all();
        expect(ret_emu).toStrictEqual([emu]);

        let ret_bit = await db.bitstreams.load_all();
        expect(ret_bit).toStrictEqual([bit]);

        return await db.delete_database();
    });

    afterAll(async ()=> {
        await db.close();
    })
});