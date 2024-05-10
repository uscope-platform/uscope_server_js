import database from "../../src/Database/Database";
import peripheral_model from "../../src/data_model/peripheral_model";
import {expect} from "@jest/globals";
import {getRawAsset} from "node:sea";



describe('peripherals_database_tests', () => {

    let periph: peripheral_model[] = [
        {
            id:1,
            name:'new peripheral_77',
            image:"asfasfd",
            parametric:true,
            registers:[],
            version:"saf"
        },
        {
            id:77,
            name:'new peripheral_7',
            image:"asfasfd",
            parametric:true,
            registers:[],
            version:"saf"
        }
    ]

    let db = new database("localhost", "uscope", "test", "test_schema")


    beforeAll(async () =>{await db.init_db()})


    test('get_version_test', async () => {
        let res = await  db.peripherals.get_version();
        let uuid  = res.replaceAll("-", "");

        const isHEX = (ch:string) => "0123456789abcdef".includes(ch.toLowerCase());

        expect(uuid.length).toBe(32)
        expect([...uuid].every(isHEX)).toBeTruthy()
    });

    test('add_peripheral', async () => {
        await db.peripherals.add_peripheral(periph[0]);
        let res = await db.peripherals.get_peripheral(1);
        expect(res).toStrictEqual(periph[0]);
    });

    test('load_all', async () => {
        await db.peripherals.add_peripheral(periph[1]);
        let res = await db.peripherals.load_all();
        expect(res).toEqual(periph);
    });

    test('get_peripheral', async () => {
        let res = await db.peripherals.get_peripheral(77)
        expect(res).toEqual(periph[1]);
    });



    test('update_peripheral', async () => {
        await db.peripherals.update_peripheral_field(77, "version", "test_ver");
        let res = await db.peripherals.get_peripheral(77);
        expect(res.version).toEqual("test_ver");
    });


    test('remove_peripheral', async () => {
        await db.peripherals.remove_peripheral(77);
        let res = await db.peripherals.peripheral_exists(77);
        expect(res).toBeFalsy();
    });

    afterAll(async ()=> {
        await db.delete_database();
        db.close()
    })
});