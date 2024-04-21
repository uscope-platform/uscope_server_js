
import postgres from "postgres";
import emulators_db from "../../src/Database/emulators_db";



describe('emulator_database_tests', () => {
    let db: emulators_db = new emulators_db(postgres({
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



    test('get_emulator', () => {
        return db.get_emulator(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_emulator', () => {
        return db.add_emulator({
            id:77,
            name:'new peripheral_77',
            n_cycles:100,
            cores:{},
            connections:[],
            async_multirate:false
        }).then((res)=>{
            let i:number = 0;
        })
    });


    test('update_emulator', () => {
        return db.update_emulator_field(77, "async_multirate",  true).then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_emulator', () => {
        return db.remove_emulator(77).then((res)=>{
            let i:number = 0;
        })
    });

});