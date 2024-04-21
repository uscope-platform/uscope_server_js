import filters_db from "../../src/Database/filters_db";
import postgres from "postgres";


describe('filters_database_tests', () => {
    let db: filters_db = new filters_db(postgres({
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
            let i:number = 0;
        })
    });

    test('get_filter', () => {
        return db.get_filter(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_filter', () => {
        return db.add_filter({
            id: 73,
            name:"test_fltr",
            parameters:{},
            ideal_taps:[1, 2, 3],
            quantized_taps:[4, 5, 6]
        }).then((res)=>{
            let i:number = 0;
        })
    });


    test('update_filter' +
        '', () => {
        return db.update_filter_field(73, "parameters",  {test:13123}).then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_filter', () => {
        return db.remove_filter(73).then((res)=>{
            let i:number = 0;
        })
    });


});