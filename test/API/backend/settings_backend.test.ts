
import SettingsBackend from "../../../src/API/backend/settings";
import hw_interface from "../../../src/hardware_interface/hw_interface";
import {debugger_option} from "../../../src/data_model/settings_model";
import {hil_address_map} from "../../../src/data_model/operations_model";
import {expect} from "@jest/globals";

describe('filters backend test', () => {

    let result = {} as any;

    let backend = new SettingsBackend({
        set_debug_level: (level:string) =>{
            result = level;
        },
        get_debug_level: () =>{
            return "test_val_1";
        },
        get_debugger_option: (name:string) =>{
            result = name;
            return "test_val_2";
        },
        set_debugger_option: (option: debugger_option) =>{
            result = option;
        },
        set_hil_address_map: (map:hil_address_map) =>{
            result = map;
        },
        get_hil_address_map: () =>{
            return "test_val_3";
        }
    } as unknown as hw_interface);


    test('set_debug_level', async () => {
        await backend.set_debug_level("level");
        expect(result).toStrictEqual("level");
    });

    test('get_debug_level', async () => {
        let res =await backend.get_debug_level();
        expect(res).toStrictEqual("test_val_1");
    });

    test('get_debugger_option', async () => {
        let res =await backend.get_debugger_option("test_opt");
        expect(result).toStrictEqual("test_opt");
        expect(res).toStrictEqual("test_val_2");
    });

    test('set_debugger_option', async () => {
        await backend.set_debugger_option({name:"test_opt_1",value:"val"});
        expect(result).toStrictEqual({name:"test_opt_1",value:"val"});
    });

    test('set_hil_map', async () => {
        let ham : hil_address_map = {addr_map:"test"} as unknown as hil_address_map;
        await backend.set_hil_map(ham);
        expect(result).toStrictEqual(ham);
    });

    test('get_hil_map', async () => {
        let res =await backend.get_hil_map();
        expect(res).toStrictEqual("test_val_3");
    });


});
