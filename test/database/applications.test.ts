

import applications_db from "../../src/Database/applications_db";
import postgres from "postgres";



describe('applications_database_tests', () => {
    let db: applications_db = new applications_db(postgres({
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

    test('get_application', () => {
        return db.get_application(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_application', () => {
        return db.add_application({
            id: 7,
            application_name:'new application_7',
            bitstream:"",
            channels:[],
            channel_groups:[],
            clock_frequency:100000000,
            initial_registers_values:[],
            macro:[],
            parameters:[],
            peripherals:[],
            soft_cores:[],
            filters:[],
            programs:[],
            scripts:[],
            miscellaneous:{}
        }).then((res)=>{
            let i:number = 0;
        })
    });


    test('update_application', () => {
        return db.update_application_field(7, "channels",  {test:13123}).then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_application', () => {
        return db.remove_application(7).then((res)=>{
            let i:number = 0;
        })
    });


});