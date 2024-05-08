
import postgres from "postgres";
import emulators_db from "../../src/Database/emulators_db";
import database from "../../src/Database/Database";



describe('emulator_database_tests', () => {

    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})

    test('get_version_test', () => {
        return db.emulators.get_version().then((val:string)=>{
            let i:number = 0;
        })
    });

    test('load_all', () => {
        return db.emulators.load_all().then((res)=>{
            let res2 = JSON.stringify(res)
            let i:number = 0;
        })
    });



    test('get_emulator', () => {
        return db.emulators.get_emulator(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_emulator', () => {
        return db.emulators.add_emulator({
            id:77,
            name:'new peripheral_77',
            n_cycles:100,
            cores:{},
            connections:[],
            async_multirate:false
        }).then((res)=>{
            let i:number = 0;
        })
    });


    test('update_emulator', () => {
        return db.emulators.update_emulator_field(77, "async_multirate",  true).then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_emulator', () => {
        return db.emulators.remove_emulator(77).then((res)=>{
            let i:number = 0;
        })
    });

    afterAll(()=> db.close())
});