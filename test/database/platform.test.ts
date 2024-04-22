
import postgres from "postgres";
import platform_db from "../../src/Database/platform_db";



describe('platform_database_tests', () => {
    let db: platform_db = new platform_db(postgres({
        host: "localhost",
        port: 5432,
        database:"uscope",
        username: "uscope",
        password:"test"
    }));


    test('get_user', () => {
        return db.get_user("test").then((res)=>{
            let i:number = 0;
        })
    });

    test('add_user', () => {
        return db.add_user("user_88", "test", "admin").then((res)=>{
            let i:number = 0;
        })
    });

    test('remove_user', () => {
        return db.remove_user("user_88").then((res)=>{
            let i:number = 0;
        })
    });

});