import fs from "node:fs";
import {createHash} from "node:crypto";
import {
    bitstream_model, acquisition_status, channel_statuses, clock_info,
    programs_info, scope_address, select_hil_output, set_hil_inputs,
    status_object, hil_debug_model, emulator_model, read_data_response,
    application_model, register_write_model
} from "#models";
import {hw_interface} from "#hw";
import {database} from "#database";

export class OperationsBackend {
    private hw_if: hw_interface;
    public db: database;

    constructor(db: database, hw: hw_interface) {
        this.hw_if = hw;
        this.db = db;
    }

    public async load_application(app:application_model, bit:bitstream_model) {
        const fs_path =  process.env.BITSTREAMS_DIR + "/" + app.bitstream;
        this.refresh_bitfile(bit, fs_path);
        return await this.hw_if.load_bitstream(fs_path);
    }

    public async fetch_data() : Promise<read_data_response>{
        return await this.hw_if.read_data();
    }

    public async read_register(addr:number) : Promise<number> {
        return await this.hw_if.read_register(addr);
    }

    public async write_register(reg:register_write_model) : Promise<any> {
        return await this.hw_if.write_register(reg);
    }


    public async set_scaling_factors(factors:number[]) : Promise<any> {
        return await this.hw_if.set_scaling_factors(factors);
    }

    public async set_channel_status(status:channel_statuses) : Promise<any> {
        return await this.hw_if.set_channel_status(status);
    }

    public async get_acquisition() : Promise<string> {
        return this.hw_if.get_acquisition_status();
    }

    public async set_acquisition(status:acquisition_status) : Promise<any> {
        return this.hw_if.set_acquisition(status)
    }

    public async set_scope_address(addr:scope_address): Promise<any>{
        return this.hw_if.set_scope_address(addr);
    }

    public async set_dma_disable(status:status_object): Promise<any>{
        return this.hw_if.set_dma_disable(status);
    }

    public async hil_select_output(out:select_hil_output): Promise<any>{
        return this.hw_if.select_output(out);
    }

    public async hil_set_input(input:set_hil_inputs): Promise<any>{
        return this.hw_if.set_input(input);
    }

    public async hil_start(): Promise<any>{
        return this.hw_if.start_hil();
    }

    public async hil_stop(): Promise<any>{
        return this.hw_if.stop_hil();
    }

    public async hil_disassemble(hil:emulator_model): Promise<any>{
        return this.hw_if.hil_disassemble(hil);
    }

    public async hil_deploy(hil:emulator_model): Promise<any>{
        return this.hw_if.deploy_hil(hil);
    }

    public async hil_hardware_sim(hil:emulator_model): Promise<any>{
        return this.hw_if.hil_hardware_sim(hil);
    }

    public async get_version(component:string): Promise<string> {
        return this.hw_if.get_version(component);
    }

    public async hil_debug(command: hil_debug_model) : Promise<any> {
        return this.hw_if.debug_hil(command);
    }

    public async hil_emulate(hil:emulator_model): Promise<any>{
        return this.hw_if.emulate_hil(hil);
    }

    public async get_clocks(): Promise<any>{
        let ret : number[] = [];
        for(let i = 0; i<4; i++){
            ret.push(await this.hw_if.get_clock(i, true));
        }
        return ret;
    }

    public async set_clock(info:clock_info): Promise<any>{
        return this.hw_if.set_clock(info);
    }

    public async compile_program(prog:programs_info) : Promise<any> {
        return await this.hw_if.compile_program(prog);
    }

    public async apply_program(prog:programs_info) : Promise<any> {
        let p_obj =await this.db.programs.get_program(prog.id)

        if(prog.hash === p_obj.cached_bin_version){
            return this.hw_if.apply_program(p_obj.hex, prog.core_address);
        } else {
            let bin = await this.hw_if.compile_program(prog);
            if(bin.status ==="error"){
                return {status:"failed", error:bin.error}
            }
            await this.hw_if.apply_program(bin.hex, prog.core_address);
            await this.db.programs.update_program_field(prog.id, "hex", bin.hex);
            await this.db.programs.update_program_field(prog.id, "cached_bin_version", prog.hash);
        }
    }

    private refresh_bitfile(bitfile: bitstream_model, path:string) {
        if(process.arch == "x64") return;
        if(fs.existsSync(path)){
            let old_data = fs.readFileSync(path);
            let old_hash = createHash('sha256').update(old_data).digest('hex');
            if(old_hash === bitfile.hash){
                return;
            }
        }
        console.log("Bitstream is outdated writing new one");
        fs.writeFileSync(path, bitfile.data);
    }


}
