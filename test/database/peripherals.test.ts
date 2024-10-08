import database from "../../src/Database/Database";
import peripheral_model, {field_model, register_model} from "../../src/data_model/peripheral_model";
import {expect} from "@jest/globals";



describe('peripherals_database_tests', () => {

    let periph: peripheral_model[] = [
        {
            id:1,
            name:'new peripheral_77',
            image:"",
            parametric:true,
            registers:[],
            version:"saf"
        },
        {
            id:77,
            name:'new peripheral_7',
            image:"",
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


    test('add_register', async () => {
        let reg : register_model = {
            ID:"reg_id",
            description:"desc",
            direction:"RW",
            offset:"0x0",
            register_name:"reg_name",
            value:0,
            fields:[]
        };
        await db.peripherals.add_register(77, reg);
        let res = await db.peripherals.get_peripheral(77);
        expect(res.registers).toHaveLength(1);
        expect(res.registers[0]).toStrictEqual(reg);
        reg.ID="reg_id_2";
        await db.peripherals.add_register(77,reg);
    });


    test('edit_register', async () => {
        let reg : register_model = {
            ID:"reg_id",
            description:"desc",
            direction:"RW",
            offset:"0x65",
            register_name:"reg_name23",
            value:0,
            fields:[]
        };
        await db.peripherals.edit_register(77, reg);
        let res = await db.peripherals.get_peripheral(77);
        expect(res.registers).toHaveLength(2);
        expect(res.registers[0]).toStrictEqual(reg);
    });


    test('remove_register', async () => {
        await db.peripherals.remove_register(77, "reg_id");
        let res = await db.peripherals.get_peripheral(77);
        expect(res.registers).toHaveLength(1);
        expect(res.registers[0].ID).toStrictEqual("reg_id_2");
    });


    test('add_field', async () => {
        let fld : field_model = {
            name:"field",
            description:"desc",
            length:4,
            offset:8
        };
        await db.peripherals.add_field(77, "reg_id_2", fld);
        let res = await db.peripherals.get_peripheral(77);
        expect(res.registers[0].fields).toHaveLength(1);
        expect(res.registers[0].fields[0]).toStrictEqual(fld);
        fld.name="field_2";
        await db.peripherals.add_field(77,"reg_id_2", fld);
        try{
            await db.peripherals.add_field(77, "zazzera", fld);
            expect(true).toStrictEqual(false);
        } catch (e) {
            expect(e).toStrictEqual("Register not found");
        }
    });

    test('edit_field', async () => {
        let fld : field_model = {
            name:"field",
            description:"desc",
            length:1,
            offset:8
        };
        await db.peripherals.edit_field(77, "reg_id_2",fld);
        let res = await db.peripherals.get_peripheral(77);
        expect(res.registers[0].fields).toHaveLength(2);
        expect(res.registers[0].fields[0]).toStrictEqual(fld);
        try{
            await db.peripherals.edit_field(77, "zazzera", fld);
            expect(true).toStrictEqual(false);
        } catch (e) {
            expect(e).toStrictEqual("Register not found");
        }
    });


    test('delete_field', async () => {
        await db.peripherals.remove_field(77, "reg_id_2","field");
        let res = await db.peripherals.get_peripheral(77);
        expect(res.registers[0].fields).toHaveLength(1);
        expect(res.registers[0].fields[0].name).toStrictEqual("field_2");
        try{
            await db.peripherals.remove_field(77, "zazzera", "field_2");
            expect(true).toStrictEqual(false);
        } catch (e) {
            expect(e).toStrictEqual("Register not found");
        }
    });

    test('remove_peripheral', async () => {
        await db.peripherals.remove_peripheral(77);
        let res = await db.peripherals.peripheral_exists(77);
        expect(res).toBeFalsy();
    });

    afterAll(async ()=> {
        await db.delete_database();
        await db.close()
    })
});