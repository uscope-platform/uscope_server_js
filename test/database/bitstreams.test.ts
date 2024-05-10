import database from "../../src/Database/Database";


describe('emulator_database_tests', () => {

    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})

    test('get_version_test', () => {
        return db.bitstreams.get_version().then((val:string)=>{
            let i:number = 0;
        })
    });

    test('load_all', () => {
        return db.bitstreams.load_all().then((res)=>{
            let res2 = JSON.stringify(res)
            let i:number = 0;
        })
    });



    test('get_bitstream', () => {
        return db.bitstreams.get_bitstream(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_emulator', () => {
        return db.bitstreams.add_bitstream({
            id:77,
            path:'new peripheral_77'
        }).then((res)=>{
            let i:number = 0;
        })
    });


    test('update_emulator', () => {
        return db.bitstreams.update_bitstream_field(77, "path",  "cecca").then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_emulator', () => {
        return db.bitstreams.remove_bitstream(77).then((res)=>{
            let i:number = 0;
        })
    });

    afterAll(()=> db.close())
});