import bitstreams_db from "../../src/Database/bitstreams_db";
import postgres from "postgres";


describe('emulator_database_tests', () => {
    let db: bitstreams_db = new bitstreams_db(postgres({
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



    test('get_bitstream', () => {
        return db.get_bitstream(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_emulator', () => {
        return db.add_bitstream({
            id:77,
            path:'new peripheral_77'
        }).then((res)=>{
            let i:number = 0;
        })
    });


    test('update_emulator', () => {
        return db.update_bitstream_field(77, "path",  "cecca").then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_emulator', () => {
        return db.remove_bitstream(77).then((res)=>{
            let i:number = 0;
        })
    });

});