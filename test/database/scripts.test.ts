
import scripts_db from "../../src/Database/scripts_db";
import postgres from "postgres";
import database from "../../src/Database/Database";



describe('script_database_tests', () => {
    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})


    test('get_version_test', () => {
        return db.scripts.get_version().then((val:string)=>{
            let i:number = 0;
        })
    });

    test('load_all', () => {
        return db.scripts.load_all().then((res)=>{
            let res2 = JSON.stringify(res)
            let i:number = 0;
        })
    });


    test('get_script', () => {
        return db.scripts.get_script(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_script', () => {
        return db.scripts.add_script({
            id: 7,
            name: "test_script_54",
            path:"",
            script_content:"console.log('test')",
            triggers:"trogger"
        }).then((res)=>{
            let i:number = 0;
        })
    });


    test('update_script', () => {
        return db.scripts.update_script_field(7, "path",  "test.js").then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_application', () => {
        return db.scripts.remove_script(7).then((res)=>{
            let i:number = 0;
        })
    });

    afterAll(()=> db.close())
});