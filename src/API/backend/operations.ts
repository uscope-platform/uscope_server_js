import {application_model, core_load_info} from "../../data_model/application_model";
import fs from "node:fs";
import {createHash} from "node:crypto";
import bitstream_model from "../../data_model/bitstreams_model";
import hw_interface from "../../hw_interface";
import register_write_model, {programs_info} from "../../data_model/operations_model";
import database from "../../Database/Database";

export default class OperationsBackend {
    private hw_if: hw_interface;
    public db: database;

    constructor(driver_host: string, driver_port: number, db: database) {
        this.hw_if = new hw_interface(driver_host, driver_port);
        this.db = db;
    }

    public async load_application(app:application_model, bit:bitstream_model) {
        const fs_path = "/lib/firmware/" + app.bitstream;
        this.refresh_bitfile(bit, fs_path);
        await this.hw_if.load_bitstream(fs_path);
    }


    public async read_register(addr:number) : Promise<number> {
        return await this.hw_if.read_register(addr);
    }

    public async write_register(reg:register_write_model) : Promise<any> {
        return await this.hw_if.write_register(reg);
    }

    public async compile_program(prog:programs_info) : Promise<any> {
        return await this.hw_if.compile_program(prog);
    }

    public async apply_program(prog:programs_info) : Promise<any> {
        let p_obj =await this.db.programs.get_program(prog.id)

        if(prog.hash === p_obj.cached_bin_version){
            return this.hw_if.apply_program(p_obj.hex, prog.core_address);
        } else {
            let bin = await this.compile_program(prog);
            if(bin.status ==="error"){
                return {status:"failed", error:bin.error}
            }
            await this.hw_if.apply_program(bin.hex, prog.core_address);
            await this.db.programs.update_program_field(prog.id, "cached_bin_version", bin.hash);
        }
    }

    private refresh_bitfile(bitfile: bitstream_model, path:string) {

        let old_data = fs.readFileSync(path);
        let old_hash = createHash('sha256').update(old_data).digest('hex');
        if(old_hash !== bitfile.hash){
            fs.writeFileSync(path, bitfile.data);
        }
    }


}
