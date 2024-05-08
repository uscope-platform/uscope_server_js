

import applications_db from "../../src/Database/applications_db";
import postgres from "postgres";
import database from "../../src/Database/Database";
import {expect} from "@jest/globals";
import {before} from "node:test";



describe('applications_database_tests',  () => {

    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})

    test('get_version_test', () => {
       return db.applications.get_version().then((val:string)=>{
           let uuid  = val.replaceAll("-", "");

           const isHEX = (ch:string) => "0123456789abcdef".includes(ch.toLowerCase());

           expect(uuid.length).toBe(32)
           expect([...uuid].every(isHEX)).toBeTruthy()
       })
    });

    test('load_all', () => {
        return db.applications.load_all().then((res)=>{
            let res2 = JSON.stringify(res)
            let i:number = 0;
        })
    });

    test('get_application', () => {
        return db.applications.get_application(1).then((res)=>{
            let i:number = 0;
        })
    });

    test('add_application', () => {
        return db.applications.add_application({
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
        let updated_app = {
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
        }
        return db.applications.update_application_field(updated_app).then((res)=>{
            let i:number = 0;
        })
    });


    test('remove_application', () => {
        return db.applications.remove_application(7).then((res)=>{
            let i:number = 0;
        })
    });

    afterAll(()=> db.close())
});