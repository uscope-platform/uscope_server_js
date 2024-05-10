import database from "../../src/Database/Database";
import bitstream_model from "../../src/data_model/bitstreams_model";
import {expect} from "@jest/globals";


describe('bitstreams_database_tests', () => {


    let bit: bitstream_model[] = [
        {
            id:1,
            path:'test_1'
        },
        {
            id:2,
            path:'test_2'
        }
    ]

    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})

    test('get_version_test', async () => {
        let res = await  db.bitstreams.get_version();
        let uuid  = res.replaceAll("-", "");

        const isHEX = (ch:string) => "0123456789abcdef".includes(ch.toLowerCase());

        expect(uuid.length).toBe(32)
        expect([...uuid].every(isHEX)).toBeTruthy()
    });

    test('add_emulator', async () => {
        await db.bitstreams.add_bitstream(bit[0]);
        let res = await db.bitstreams.get_bitstream(1);
        expect(res).toEqual(bit[0]);
    });

    test('load_all', async () => {
        await db.bitstreams.add_bitstream(bit[1]);
        let res = await db.bitstreams.load_all();
        expect(res).toEqual(bit);
    });



    test('get_bitstream', async () => {
        let res = await db.bitstreams.get_bitstream(2);
        expect(res).toStrictEqual(bit[1]);
    });



    test('update_emulator', async () => {
        await db.bitstreams.update_bitstream_field(2, "path", "changed")
        let ret =await db.bitstreams.get_bitstream(2);
        expect(ret.path).toEqual("changed");
    });


    test('remove_emulator', async () => {
        await db.bitstreams.remove_bitstream(2);
        let res = await db.bitstreams.bitstream_exists(2);
        expect(res).toBeFalsy();
    });

    afterAll(async ()=> {
        await db.delete_database();
        db.close();
    })
});