import {database} from "#database";
import {rpu_model} from "#models";
import {expect} from "@jest/globals";
import * as fs from "node:fs";
import {createHash} from "node:crypto";


describe('rpu_database_tests', () => {
    // the content is opaque to the server: any binary file stands in for an elf
    let data = fs.readFileSync(__dirname + "/../data/mock.bit");
    let hash = createHash('sha256').update(data).digest('hex');

    let progs: rpu_model[] = [
        {
            id:1,
            name:'test_1',
            core:0,
            data: data,
            hash: hash
        },
        {
            id:2,
            name:'test_2',
            core:1,
            data: data,
            hash: hash
        }
    ]

    let db = new database("localhost", "uscope", "test", "test_schema")

    let check_program = (res:rpu_model, expected:rpu_model) => {
        expect(res.id).toBe(expected.id)
        expect(res.name).toBe(expected.name)
        expect(res.core).toBe(expected.core)
        expect((<Buffer>res.data).equals(<Buffer>expected.data)).toBeTruthy();
        expect(res.hash).toBe(expected.hash)
    }

    beforeAll(async () =>{
        await db.init_db();
    })

    test('get_version_test', async () => {
        let res = await  db.rpu_programs.get_version();
        let uuid  = res.replaceAll("-", "");

        const isHEX = (ch:string) => "0123456789abcdef".includes(ch.toLowerCase());

        expect(uuid.length).toBe(32)
        expect([...uuid].every(isHEX)).toBeTruthy()
    });

    test('add_rpu_program', async () => {
        let before = await db.rpu_programs.get_version();
        await db.rpu_programs.add_rpu_program(progs[0]);
        let res = await db.rpu_programs.get_rpu_program(1);
        check_program(res, progs[0]);
        // a change to the table has to change the version the clients poll
        expect(await db.rpu_programs.get_version()).not.toBe(before);
    });

    test('load_all', async () => {
        await db.rpu_programs.add_rpu_program(progs[1]);
        let res = await db.rpu_programs.load_all();
        expect(res.length).toBe(2);
        check_program(res[0], progs[0]);
        check_program(res[1], progs[1]);
    });

    test('get_rpu_program', async () => {
        let res = await db.rpu_programs.get_rpu_program(2);
        check_program(res, progs[1]);
    });

    test('get_rpu_program by name', async () => {
        let res = await db.rpu_programs.get_by_name("test_2");
        check_program(res, progs[1]);
    });

    test('update_rpu_program name', async () => {
        await db.rpu_programs.update_rpu_program_field(2, "name", "changed")
        let ret = await db.rpu_programs.get_rpu_program(2);
        expect(ret.name).toEqual("changed");
    });

    test('update_rpu_program core', async () => {
        await db.rpu_programs.update_rpu_program_field(2, "core", 3)
        let ret = await db.rpu_programs.get_rpu_program(2);
        expect(ret.core).toEqual(3);
    });

    test('update_rpu_program data', async () => {
        let new_data = Buffer.from("new program content");
        await db.rpu_programs.update_rpu_program_field(2, "data", new_data)
        let ret = await db.rpu_programs.get_rpu_program(2);
        expect((<Buffer>ret.data).equals(new_data)).toBeTruthy();
        expect(ret.hash).toBe(createHash('sha256').update(new_data).digest('hex'));
    });

    test('remove_rpu_program', async () => {
        await db.rpu_programs.remove_rpu_program(2);
        let res = await db.rpu_programs.rpu_program_exists(2);
        expect(res).toBeFalsy();
    });

    afterAll(async ()=> {
        await db.delete_database();
        await db.close();
    })
});
