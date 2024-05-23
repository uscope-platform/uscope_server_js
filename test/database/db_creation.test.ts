import database from "../../src/Database/Database";
import {expect} from "@jest/globals";
import applications_db from "../../src/Database/applications_db";
import postgres from "postgres";


describe('db_creation_test', () => {

    let db = new database("localhost", "uscope", "test", "test_schema")

    let check_db =postgres({
        host: "localhost",
        port: 5432,
        database:"uscope",
        username: "uscope",
        password:"test"
    });

    test('create_db', () => {
        return db.init_db().then(async ()=>{
            let res = await check_db`
                SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'test_schema';
            `
            expect(res.length).toBe(1)

             res = await check_db`
                 select tablename from pg_tables where schemaname = 'test_schema';
            `
            let results_array = [];
            results_array = res.map((val)=>val.tablename);
            expect(results_array).toEqual(expect.arrayContaining(["applications", "bitstreams", "data_versions","emulators", "filters",
                "login_tokens", "peripherals", "programs", "scripts", "users"]));


            let columns_map: {
                [index: string]: string[];
            } = {
                applications:[
                    "application_name", "bitstream", "clock_frequency","channels", "channel_groups",
                    "initial_registers_values", "macro", "parameters", "peripherals", "pl_clocks", "miscellaneous",
                    "soft_cores", "filters", "programs", "scripts", "id"
                ],
                bitstreams:["id", "path", "data", "hash"],
                data_versions:["table", "version", "last_modified"],
                emulators:["id", "emulation_time", "cores", "connections", "name"],
                filters:["id", "ideal_taps", "quantized_taps", "name", "parameters"],
                login_tokens:["selector", "validator", "expiry", "username"],
                peripherals:["id", "image", "name", "parametric", "registers", "version"],
                programs:["id", "build_settings", "headers", "type", "hex", "name", "cached_bin_version", "content"],
                scripts:["id", "content", "name", "path", "triggers"],
                users:["pw_hash", "role", "username"]
            }

            for(let tab in columns_map){
                res = await check_db`
                        SELECT column_name FROM information_schema.columns WHERE table_schema = 'test_schema' AND table_name = ${tab};
            `
                results_array = res.map((val)=>val.column_name);
                expect(results_array.sort()).toStrictEqual(columns_map[tab].sort());
            }

             res = await check_db`
                select event_manipulation, event_object_table from information_schema.triggers where trigger_schema = 'test_schema'
            `
            let expected_res = []
            for(let tab of ["programs", "scripts", "applications", "peripherals", "emulators", "bitstreams", "filters" ]){
                expected_res.push({event_manipulation:"INSERT", event_object_table:tab})
                expected_res.push({event_manipulation:"DELETE", event_object_table:tab})
                expected_res.push({event_manipulation:"UPDATE", event_object_table:tab})
            }
            expect(res).toEqual(expect.arrayContaining(expected_res));
        })
    });
    afterAll(async ()=> {
        await db.delete_database()
        await db.close();
        await check_db.end();
    })
});