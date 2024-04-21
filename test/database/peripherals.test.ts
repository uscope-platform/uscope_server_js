
import postgres from "postgres";
import peripherals_db from "../../src/Database/peripherals_db";



describe('programs_database_tests', () => {
    let db: peripherals_db = new peripherals_db(postgres({
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



    test('get_peripheral', () => {
        return db.get_peripheral(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_peripheral', () => {
        return db.add_peripheral({
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
        return db.update_peripheral_field(77, "version",  "asfasf.js").then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_peripheral', () => {
        return db.remove_peripheral(77).then((res)=>{
            let i:number = 0;
        })
    });

});