
import scripts_db from "../../src/Database/scripts_db";
import postgres from "postgres";



describe('script_database_tests', () => {
    let db: scripts_db = new scripts_db(postgres({
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



    test('get_script', () => {
        return db.get_script(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_script', () => {
        return db.add_script({
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
        return db.update_script_field(7, "path",  "test.js").then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_application', () => {
        return db.remove_script(7).then((res)=>{
            let i:number = 0;
        })
    });

});