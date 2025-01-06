
import {hw_interface} from "#hw";
import {hil_address_map, debugger_option} from "../../data_model";

export class SettingsBackend {
    private hw_if: hw_interface;
    constructor(hw: hw_interface) {
        this.hw_if = hw;
    }

    public async set_debug_level(level:string): Promise<any>{
        return this.hw_if.set_debug_level(level);
    }

    public async get_debug_level(): Promise<string>{
        return this.hw_if.get_debug_level();
    }

    public async get_debugger_option(name:string): Promise<debugger_option>{
        return this.hw_if.get_debugger_option(name);
    }

    public async set_debugger_option(option: debugger_option): Promise<any>{
        return this.hw_if.set_debugger_option(option);
    }

    public async set_hil_map(map:hil_address_map): Promise<any>{
        return this.hw_if.set_hil_address_map(map);
    }

    public async get_hil_map(): Promise<hil_address_map>{
        return this.hw_if.get_hil_address_map();
    }
}
