import database from "../../src/Database/Database";
import {expect} from "@jest/globals";
import emulator_model from "../../src/data_model/emulator_model";



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

    test('update_emulator', async () => {
        await db.emulators.update_emulator_field(1, "emulation_time", 12);
        let res = await db.emulators.get_emulator(1);
        expect(res.emulation_time).toBe(12);
    });


    test('remove_emulator', async () => {
        await db.emulators.remove_emulator(2);
        let res = await db.emulators.emulator_exists(2);
        expect(res).toBeFalsy();
    });

    afterAll(async ()=> {
        await await db.delete_database();
        db.close();
    })
});