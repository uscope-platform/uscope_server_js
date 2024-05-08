import filters_db from "../../src/Database/filters_db";
import postgres from "postgres";
import database from "../../src/Database/Database";


describe('filters_database_tests', () => {

    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})

    test('get_version_test', () => {
        return db.filters.get_version().then((val:string)=>{
            let i:number = 0;
        })
    });

    test('load_all', () => {
        return db.filters.load_all().then((res)=>{
            let i:number = 0;
        })
    });

    test('get_filter', () => {
        return db.filters.get_filter(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_filter', () => {
        return db.filters.add_filter({
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
        return db.filters.update_filter_field(73, "parameters",  {test:13123}).then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_filter', () => {
        return db.filters.remove_filter(73).then((res)=>{
            let i:number = 0;
        })
    });

    afterAll(()=> db.close())
});