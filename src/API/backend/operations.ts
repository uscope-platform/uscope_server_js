import {application_model, core_load_info} from "../../data_model/application_model";
import fs from "node:fs";
import {createHash} from "node:crypto";
import bitstream_model from "../../data_model/bitstreams_model";
import hw_interface from "../../hw_interface";

export default class OperationsBackend {
    private hw_if: hw_interface;

    constructor(driver_host: string, driver_port: number) {
        this.hw_if = new hw_interface(driver_host, driver_port);
    }

    public async load_application(app:application_model, bit:bitstream_model) {
        const fs_path = "/lib/firmware/" + app.bitstream;
        this.refresh_bitfile(bit, fs_path);
        await this.hw_if.load_bitstream(fs_path);
    }


    public async read_register(addr:number) : Promise<number> {
        // TODO: implement register reading
        return 0;
    }

    public async write_registers(addr:number, value:number) : Promise<any> {
        // TODO: implement register writing
        return 0;
    }

    private refresh_bitfile(bitfile: bitstream_model, path:string) {

        let old_data = fs.readFileSync(path);
        let old_hash = createHash('sha256').update(old_data).digest('hex');
        if(old_hash !== bitfile.hash){
            fs.writeFileSync(path, bitfile.data);
        }
    }

    private load_core(core:core_load_info){
        // TODO:  implement core loading
        return 0;
    }

}
