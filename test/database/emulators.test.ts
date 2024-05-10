import database from "../../src/Database/Database";
import filter_model from "../../src/data_model/filters_model";
import {expect} from "@jest/globals";
import emulator_model from "../../src/data_model/emulator_model";



describe('emulator_database_tests', () => {

    let emu: emulator_model[] = [
        {
            id:1,
            name:'new new emulator',
            n_cycles:100,
            cores:{},
            connections:[]
        },
        {
            id:2,
            name:'test',
            n_cycles:100,
            cores:{},
            connections:[]
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
        await db.emulators.update_emulator_field(1, "n_cycles", 12);
        let res = await db.emulators.get_emulator(1);
        expect(res.n_cycles).toBe(12);
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