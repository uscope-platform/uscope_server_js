
import postgres from "postgres";
import peripherals_db from "../../src/Database/peripherals_db";
import database from "../../src/Database/Database";



describe('programs_database_tests', () => {

    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})

    test('get_version_test', () => {
        return db.peripherals.get_version().then((val:string)=>{
            let i:number = 0;
        })
    });

    test('load_all', () => {
        return db.peripherals.load_all().then((res)=>{
            let res2 = JSON.stringify(res)
            let i:number = 0;
        })
    });

    test('get_peripheral', () => {
        return db.peripherals.get_peripheral(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_peripheral', () => {
        return db.peripherals.add_peripheral({
            id:77,
            name:'new peripheral_77',
            image:"asfasfd",
            parametric:true,
            registers:[],
            version:"saf"
        }).then((res)=>{
            let i:number = 0;
        })
    });

    test('update_peripheral', () => {
        return db.peripherals.update_peripheral_field(77, "version",  "asfasf.js").then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_peripheral', () => {
        return db.peripherals.remove_peripheral(77).then((res)=>{
            let i:number = 0;
        })
    });

    afterAll(()=> db.close())
});