
import postgres from "postgres";
import programs_db from "../../src/Database/programs_db";



describe('programs_database_tests', () => {
    let db: programs_db = new programs_db(postgres({
        host: "localhost",
        port: 5432,
        database:"uscope",
        username: "uscope",
        password:"test"
    }));

    test('get_version_test', () => {
        return db.get_version().then((val:string)=>{
            let i:number = 0;
        })
    });

    test('load_all', () => {
        return db.load_all().then((res)=>{
            let res2 = JSON.stringify(res)
            let i:number = 0;
        })
    });



    test('get_program', () => {
        return db.get_program(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_program', () => {
        return db.add_program({
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
        return db.update_program_field(77, "cached_bin_version",  "test.js").then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_program', () => {
        return db.remove_program(77).then((res)=>{
            let i:number = 0;
        })
    });

});