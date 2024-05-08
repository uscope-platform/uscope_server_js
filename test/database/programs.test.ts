
import postgres from "postgres";
import programs_db from "../../src/Database/programs_db";
import database from "../../src/Database/Database";



describe('programs_database_tests', () => {
    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})

    test('get_version_test', () => {
        return db.programs.get_version().then((val:string)=>{
            let i:number = 0;
        })
    });

    test('load_all', () => {
        return db.programs.load_all().then((res)=>{
            let res2 = JSON.stringify(res)
            let i:number = 0;
        })
    });



    test('get_program', () => {
        return db.programs.get_program(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_program', () => {
        return db.programs.add_program({
            id:77,
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
        }).then((res)=>{
            let i:number = 0;
        })
    });


    test('update_program', () => {
        return db.programs.update_program_field(77, "cached_bin_version",  "test.js").then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_program', () => {
        return db.programs.remove_program(77).then((res)=>{
            let i:number = 0;
        })
    });

    afterAll(()=> db.close())
});