import {database} from "#database";
import {expect} from "@jest/globals";
import {
    emulator_model, connection_model, core_model,
    efi_implementation_type, fcore_comparator_type
} from "#models";

describe('emulator_database_tests', () => {

    let emu: emulator_model[] = [
        {
            id:1,
            name:'new new emulator',
            emulation_time:100.5,
            cores:{},
            connections:[],
            deployment_mode:false,
        },
        {
            id:2,
            name:'test',
            emulation_time:10.2,
            cores:{},
            connections:[],
            deployment_mode:true,
        }
    ]

    let db = new database("localhost", "uscope", "test", "test_schema")


    beforeAll(async () =>{await db.init_db()})

    test('get_version_test',async () => {
        let res = await  db.emulators.get_version();
        let uuid  = res.replaceAll("-", "");

        const isHEX = (ch:string) => "0123456789abcdef".includes(ch.toLowerCase());

        expect(uuid.length).toBe(32)
        expect([...uuid].every(isHEX)).toBeTruthy()
    });

    test('add_emulator', async () => {
        await db.emulators.add_emulator(emu[0]);
        let res = await db.emulators.get_emulator(1);
        expect(res).toStrictEqual(emu[0]);
    });


    test('load_all', async () => {
        await db.emulators.add_emulator(emu[1]);
        let res = await db.emulators.load_all();
        expect(res).toStrictEqual(emu);
    });

    test('get_emulator', async () => {
        let res = await db.emulators.get_emulator(2);
        expect(res).toStrictEqual(emu[1]);
    });


    test('add_core', async () => {
        let core :core_model= {
            name: "test_core",
            id: 4,
            order:0,
            program:"test_program",
            channels:1,
            inputs:[],
            input_data:[],
            outputs:[],
            memory_init:[],
            options:{
                comparators:fcore_comparator_type.reducing_comparator,
                efi_implementation:efi_implementation_type.efi_none
            },
            sampling_frequency:0,
            deployment:{
                rom_address:0,
                control_address:0,
                has_reciprocal:false
            }
        }
        await db.emulators.add_core(1, core);
        let res = await db.emulators.get_emulator(1);
        expect(res.cores).toHaveProperty('4')
        expect(res.cores[4]).toStrictEqual(core);
        core.id = 6;
        await db.emulators.add_core(1, core);
    });

    test('update_core', async () => {
         let core :core_model = {
            name: "test_core_update",
            id: 4,
            order:0,
            program:"test_program",
            channels:1,
            inputs:[],
            input_data:[],
            outputs:[],
            memory_init:[],
            options:{
                comparators:fcore_comparator_type.reducing_comparator,
                efi_implementation:efi_implementation_type.efi_none
            },
            sampling_frequency:0,
            deployment:{
                rom_address:0,
                control_address:0,
                has_reciprocal:false
            }
        }
        await db.emulators.update_core(1, core);
        let res = await db.emulators.get_emulator(1);
        expect(res.cores).toHaveProperty('4')
        expect(res.cores).toHaveProperty('6')
        expect(res.cores[4]).toStrictEqual(core);
    });

    test('remove_core', async () => {
        await db.emulators.remove_core(1, 4);
        let res = await db.emulators.get_emulator(1);
        expect(res.cores).toHaveProperty('6')
    });

    test('add_connection', async () => {
        let conn :connection_model = {
            source:"src",
            destination:"dst"
        }
        await db.emulators.add_connection(1, conn);
        let res = await db.emulators.get_emulator(1);
        expect(res.connections).toHaveLength(1);
        expect(res.connections[0]).toStrictEqual(conn);
        conn.source="test";
        await db.emulators.add_connection(1, conn);
    });

    test('remove_connection', async () => {
        await  db.emulators.remove_connection(1, "src", "dst");
        let res = await db.emulators.get_emulator(1);
        expect(res.connections).toHaveLength(1);
        expect(res.connections[0].source).toStrictEqual("test");
    });


    test('update_emulator', async () => {
        await db.emulators.edit_atomic_field(1, "emulation_time", 12);
        let res = await db.emulators.get_emulator(1);
        expect(res.emulation_time).toBe(12);
    });


    test('remove_emulator', async () => {
        await db.emulators.remove_emulator(2);
        let res = await db.emulators.emulator_exists(2);
        expect(res).toBeFalsy();
    });

    afterAll(async ()=> {
        await db.delete_database();
        await db.close();
    })
});