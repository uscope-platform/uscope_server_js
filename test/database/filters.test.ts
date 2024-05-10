import database from "../../src/Database/Database";
import filter_model from "../../src/data_model/filters_model";
import {expect} from "@jest/globals";


describe('filters_database_tests', () => {


    let flt: filter_model[] = [
        {
            id: 1,
            name:"test_fltr",
            parameters:{},
            ideal_taps:[1, 2, 3],
            quantized_taps:[4, 5, 6]
        },
        {
            id: 73,
            name:"testing",
            parameters:{},
            ideal_taps:[1, 2, 3],
            quantized_taps:[4, 5, 6]
        }
    ]

    let db = new database("localhost", "uscope", "test", "test_schema")


    beforeAll(async () =>{await db.init_db()})

    test('get_version_test', async () => {
        let res = await  db.filters.get_version();
        let uuid  = res.replaceAll("-", "");

        const isHEX = (ch:string) => "0123456789abcdef".includes(ch.toLowerCase());

        expect(uuid.length).toBe(32)
        expect([...uuid].every(isHEX)).toBeTruthy()
    });

    test('add_filter', async () => {
        await db.filters.add_filter(flt[0]);
        let res = await db.filters.get_filter(1);
        expect(res).toStrictEqual(flt[0]);
    });

    test('load_all',async () => {
        await db.filters.add_filter(flt[1])
        let res = await db.filters.load_all();
        expect(res).toStrictEqual(flt);
    });

    test('get_filter', () => {
        return db.filters.get_filter(1).then((res)=>{
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

    afterAll(async ()=> {
        await db.delete_database()
        db.close()
    })
});