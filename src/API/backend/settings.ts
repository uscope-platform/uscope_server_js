
import hw_interface from "../../hardware_interface/hw_interface";
import {hil_address_map} from "../../data_model/operations_model";

export default class SettingsBackend {
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


    public async set_hil_map(map:hil_address_map): Promise<any>{
        return this.hw_if.set_hil_address_map(map);
    }

    public async get_hil_map(): Promise<hil_address_map>{
        return this.hw_if.get_hil_address_map();
    }
}
