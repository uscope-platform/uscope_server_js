import {database} from "../../src/Database";
import {expect} from "@jest/globals";
import {script_model} from "../../src/data_model";



describe('script_database_tests', () => {

    let scripts: script_model[] = [
        {
            id: 1,
            name: "test_script",
            path:"",
            content:"console.log('test')",
            triggers:"trogger"
        },
        {
            id: 2,
            name: "test_script_54",
            path:"",
            content:"cons",
            triggers:"trogger"
        }
    ]

    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})

    test('get_version_test', async () => {
        let res = await  db.scripts.get_version();
        let uuid  = res.replaceAll("-", "");

        const isHEX = (ch:string) => "0123456789abcdef".includes(ch.toLowerCase());

        expect(uuid.length).toBe(32)
        expect([...uuid].every(isHEX)).toBeTruthy()
    });

    test('add_script', async () => {
        await db.scripts.add_script(scripts[0]);
        let res = await db.scripts.get_script(1);
        expect(res).toEqual(scripts[0]);
    });


    test('load_all', async () => {
        await db.scripts.add_script(scripts[1]);
        let res = await db.scripts.load_all();
        expect(res).toEqual(scripts);
    });


    test('get_script', async () => {
        let res = await db.scripts.get_script(1);
        expect(res).toEqual(scripts[0]);
    });



    test('update_script', async () => {
        await db.scripts.update_script_field(1, "path", "test.js");
        let res =await db.scripts.get_script(1);
        expect(res.path).toEqual("test.js");
    });


    test('remove_script', async () => {
        await db.scripts.remove_script(2);
        let res = await db.scripts.script_exists(2);
        expect(res).toBeFalsy();
    });

    afterAll(async ()=> {
        await db.delete_database();
        db.close()
    })
});