
import hw_interface from "../../hw_interface";
import {hil_address_map} from "../../data_model/operations_model";

export default class SettingsBackend {
    private hw_if: hw_interface;
    constructor(driver_host: string, driver_port: number) {
        this.hw_if = new hw_interface(driver_host, driver_port);
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

    public async get_hil_map(): Promise<any>{
        return this.hw_if.get_hil_address_map();
    }
}