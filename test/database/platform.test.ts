
import postgres from "postgres";
import platform_db from "../../src/Database/platform_db";
import database from "../../src/Database/Database";



describe('platform_database_tests', () => {

    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})

    test('get_user', () => {
        return db.platform.get_user("test").then((res)=>{
            let i:number = 0;
        })
    });

    test('add_user', () => {
        return db.platform.add_user("user_88", "test", "admin").then((res)=>{
            let i:number = 0;
        })
    });

    test('remove_user', () => {
        return db.platform.remove_user("user_88").then((res)=>{
            let i:number = 0;
        })
    });

    afterAll(()=> db.close())
});