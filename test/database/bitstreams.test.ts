import database from "../../src/Database/Database";
import bitstream_model from "../../src/data_model/bitstreams_model";
import {expect} from "@jest/globals";
import * as fs from "node:fs";
import {createHash} from "node:crypto";


describe('bitstreams_database_tests', () => {
    let data = fs.readFileSync(__dirname + "/../data/mock.bit");
    let hash = createHash('sha256').update(data).digest('hex');

    let bit: bitstream_model[] = [
        {
            id:1,
            name:'test_1',
            data: data,
            hash: hash
        },
        {
            id:2,
            name:'test_2',
            data: data,
            hash: hash
        }
    ]

    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{
        await db.init_db();
    })

    test('get_version_test', async () => {
        let res = await  db.bitstreams.get_version();
        let uuid  = res.replaceAll("-", "");

        const isHEX = (ch:string) => "0123456789abcdef".includes(ch.toLowerCase());

        expect(uuid.length).toBe(32)
        expect([...uuid].every(isHEX)).toBeTruthy()
    });

    test('add_bitstream', async () => {
        await db.bitstreams.add_bitstream(bit[0]);
        let res = await db.bitstreams.get_bitstream(1);
        expect(res.id).toBe(bit[0].id)
        expect(res.name).toBe(bit[0].name)
        expect((<Buffer>res.data).equals(<Buffer>bit[0].data)).toBeTruthy();
        expect(res.hash).toBe(bit[0].hash)
    });

    test('load_all', async () => {
        await db.bitstreams.add_bitstream(bit[1]);
        let res = await db.bitstreams.load_all();
        expect(res.length).toBe(2);
        expect(res[0].id).toBe(bit[0].id)
        expect(res[0].name).toBe(bit[0].name)
        expect((<Buffer>res[0].data).equals(<Buffer>bit[0].data)).toBeTruthy();
        expect(res[0].hash).toBe(bit[0].hash)

        expect(res[1].id).toBe(bit[1].id)
        expect(res[1].name).toBe(bit[1].name)
        expect((<Buffer>res[1].data).equals(<Buffer>bit[1].data)).toBeTruthy();
        expect(res[1].hash).toBe(bit[1].hash)

    });

    test('get_bitstream', async () => {
        let res = await db.bitstreams.get_bitstream(2);
        expect(res.id).toBe(bit[1].id)
        expect(res.name).toBe(bit[1].name)
        expect((<Buffer>res.data).equals(<Buffer>bit[1].data)).toBeTruthy();
        expect(res.hash).toBe(bit[1].hash)
    });

    test('get_bitstream by path', async () => {
        let res = await db.bitstreams.get_by_name("test_2");

        expect(res.id).toBe(bit[1].id)
        expect(res.name).toBe(bit[1].name)
        expect((<Buffer>res.data).equals(<Buffer>bit[1].data)).toBeTruthy();
        expect(res.hash).toBe(bit[1].hash)
    });

    test('update_emulator', async () => {
        await db.bitstreams.update_bitstream_field(2, "name", "changed")
        let ret =await db.bitstreams.get_bitstream(2);
        expect(ret.name).toEqual("changed");
    });

    test('remove_emulator', async () => {
        await db.bitstreams.remove_bitstream(2);
        let res = await db.bitstreams.bitstream_exists(2);
        expect(res).toBeFalsy();
    });

    afterAll(async ()=> {
        await db.delete_database();
        await db.close();
    })
});