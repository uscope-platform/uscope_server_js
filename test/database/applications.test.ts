import {database} from "../../src/Database";
import {expect} from "@jest/globals";



describe('applications_database_tests',  () => {

    let apps = [
        {
            id: 1,
            application_name:'new application_7',
            bitstream:"",
            channels:[],
            channel_groups:[],
            clock_frequency:0,
            initial_registers_values:[],
            macro:[],
            parameters:[],
            peripherals:[],
            soft_cores:[],
            filters:[],
            programs:[],
            scripts:[],
            miscellaneous:{},
            pl_clocks:{
                "0":140e6,
                "1":130e6,
                "2":120e6,
                "3":110e6
            }
        },
        {
            id: 2,
            application_name:'new application_2',
            bitstream:"",
            channels:[],
            channel_groups:[],
            clock_frequency:0,
            initial_registers_values:[],
            macro:[],
            parameters:[],
            peripherals:[],
            soft_cores:[],
            filters:[],
            programs:[],
            scripts:[],
            miscellaneous:{},
            pl_clocks:{
                "0":140e6,
                "1":130e6,
                "2":120e6,
                "3":110e6
            }
        }
    ]

    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})

    test('get_version_test', async () => {
        let res = await  db.applications.get_version();
        let uuid  = res.replaceAll("-", "");

        const isHEX = (ch:string) => "0123456789abcdef".includes(ch.toLowerCase());

        expect(uuid.length).toBe(32)
        expect([...uuid].every(isHEX)).toBeTruthy()
    });

    test('add_application', async () => {
        await db.applications.add_application(apps[0]);
        let res = await db.applications.get_application(1);
        expect(res).toEqual(apps[0]);
    });

    test('load_all', async () => {
        await db.applications.add_application(apps[1]);
        let res = await db.applications.load_all();
        expect(res).toEqual(apps);
    });

    test('get_application', async () => {
        let res = await db.applications.get_application(2);
        expect(res).toEqual(apps[1]);

    });

    test('update_application', async () => {
        let updated_app = {
            id: 1,
            application_name:'new application_7',
            bitstream:"test_bitstream.bit",
            channels:[],
            channel_groups:[],
            clock_frequency:0,
            initial_registers_values:[],
            macro:[],
            parameters:[],
            peripherals:[],
            soft_cores:[],
            filters:[],
            programs:[],
            scripts:[],
            miscellaneous:{},
            pl_clocks: {
                "0": 140e6,
                "1": 130e6,
                "2": 120e6,
                "3": 110e6
            }
        }
        await db.applications.update_application_field(updated_app);
        let res = await db.applications.get_application(1);
        expect(res).toEqual(updated_app);
    });


    test('remove_application', async () => {
        await db.applications.remove_application(2);
        let res = await db.applications.application_exists(2)
        expect(res).toBeFalsy();
    });

    afterAll(async ()=> {
        await db.delete_database();
        db.close()
    })
});