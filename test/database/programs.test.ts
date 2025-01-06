import {database} from "../../src/Database";
import {program_model} from "../../src/data_model";
import {expect} from "@jest/globals";



describe('programs_database_tests', () => {

    let programs: program_model[] = [
        {
            id:1,
            name:'new program_77',
            content:'',
            type:'',
            build_settings:{
                io:{
                    inputs: [],
                    outputs: [],
                    memories: []
                }
            },
            hex:[],
            headers:[],
            cached_bin_version:""
        },
        {
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
    ]

    let db = new database("localhost", "uscope", "test", "test_schema")


    beforeAll(async () =>{await db.init_db()})


    test('get_version_test',async () => {
        let res = await  db.programs.get_version();
        let uuid  = res.replaceAll("-", "");

        const isHEX = (ch:string) => "0123456789abcdef".includes(ch.toLowerCase());

        expect(uuid.length).toBe(32)
        expect([...uuid].every(isHEX)).toBeTruthy()
    });


    test('add_program', async () => {
        await db.programs.add_program(programs[0]);
        let res = await db.programs.get_program(1);
        expect(res).toEqual(programs[0]);
    });


    test('load_all', async () => {
        await db.programs.add_program(programs[1]);
        let res = await db.programs.load_all();
        expect(res).toEqual(programs);
    });



    test('get_program', async () => {
        let res = await db.programs.get_program(2);
        expect(res).toEqual(programs[1]);
    });


    test('update_program',async () => {
        await db.programs.update_program_field(2, "cached_bin_version",  "test.js");
        let res = await db.programs.get_program(2);
        expect(res.cached_bin_version).toEqual("test.js");
    });


    test('remove_program', async () => {
        await db.programs.remove_program(2)
        let res = await db.programs.program_exists(2);
        expect(res).toBeFalsy();
    });

    afterAll(async ()=> {
        await db.delete_database();
        db.close()
    })
});