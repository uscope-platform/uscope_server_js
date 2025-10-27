import {
    acquisition_status, channel_statuses, clock_info, hil_address_map, scope_address,
    select_hil_output, set_hil_inputs, status_object, read_data_response, debugger_option
} from "#models";
import {commands} from ".";
import {Socket} from "node:net";
import {pack, unpack} from "msgpackr";


export class hw_interface {
    private host: string;
    private port: number;

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port;
    }

    public async close()  {

    }

    private async read_n_bytes(socket: Socket, n: number) : Promise<Buffer>{
        return new Promise((resolve) => {
            let buffer = Buffer.alloc(0);
            const onData = () => {
                const chunk = socket.read(n - buffer.length);
                if (chunk) {
                    buffer = Buffer.concat([buffer, chunk]);
                    if (buffer.length >= n) {
                        socket.off('readable', onData);
                        resolve(buffer);
                    }
                }
            };
            socket.on('readable', onData);
        });
    }

    private async send_command(command:string, args:any): Promise<any> {
        let socket = new Socket();
        await new Promise((resolve, reject) => {
            socket.connect(this.port, this.host, ()=>{
                resolve("")
            });
            socket.on('error', reject);
        });

        let command_obj = {"cmd": command, "args": args}
        let raw_command = pack(command_obj)
        let raw_length = Buffer.alloc(4);
        raw_length.writeUInt32LE( raw_command.length)

        socket.write(raw_length);
        let ack = await this.read_n_bytes(socket, 1);
        if(ack[0] != 107){
            console.log("NACK RECEIVED WHEN SENDING " + command_obj);
        }
        socket.write(raw_command);
        let raw_resp_size = await this.read_n_bytes(socket, 4);
        let resp_size = raw_resp_size.readUint32LE(0);
        socket.write("k");
        let raw_resp = await this.read_n_bytes(socket, resp_size);
        socket.end();
        let resp = unpack(raw_resp).body;
        if(resp.response_code != 1){
            throw resp.data;
        } else{
            return resp.data;
        }
    }

    public async read_data(): Promise<read_data_response> {
        return await this.send_command(commands.scope.read_data,{});
    }

    public async get_acquisition_status() : Promise<string> {
        return await this.send_command(commands.scope.get_acquisition_status, {});
    }

    public async get_debug_level(): Promise<string>{
        return await this.send_command(commands.platform.get_debug_level, {})
    }

    public async get_debugger_option(name:string): Promise<debugger_option>{
        throw new Error("set_debugger_option is not implemented.");
    }

    public async set_debugger_option(option: debugger_option): Promise<any>{
        throw new Error("set_debugger_option is not implemented.");
    }


    public async get_version(component:string): Promise<string>{
        return await this.send_command(commands.platform.get_version, component);
    }

    public async set_debug_level(level:string){
        return await this.send_command(commands.platform.set_debug_level, level);
    }

    public async set_scope_address(address:scope_address){
        return await this.send_command(commands.scope.set_scope_address, address);
    }

    public async set_dma_disable(status:status_object){
        return await this.send_command(commands.scope.disable_scope_dma, status);
    }

    public async load_bitstream(bit:Buffer){
        let bit_string = bit.toString("base64")
        return await this.send_command(commands.control.load_bitstream,bit_string);
    }


    public async set_scaling_factors(factors:number[]){
        return await this.send_command(commands.scope.set_scaling_factors, factors);
    }

    public async set_channel_status(status:channel_statuses){
        return await this.send_command(commands.scope.set_channel_status, status);
    }

    public async read_register(address:number): Promise<number>{
        return  await this.send_command(commands.control.register_read, address);
    }
    public async write_register(write_obj:object){
        return await this.send_command(commands.control.register_write, write_obj);
    }


    public async set_hil_address_map(addr_map:hil_address_map){
        return await this.send_command(commands.core.set_hil_address_map, addr_map);
    }

    public async get_hil_address_map(): Promise<hil_address_map>{
        let map = <hil_address_map>await this.send_command(commands.core.get_hil_address_map, {});

        map.bases.cores_inputs = Number(map.bases.cores_inputs);
        map.bases.cores_control = Number(map.bases.cores_control);
        map.bases.controller = Number(map.bases.controller);
        map.bases.hil_control = Number(map.bases.hil_control);
        map.bases.scope_mux = Number(map.bases.scope_mux);
        map.bases.cores_rom = Number(map.bases.cores_rom);
        map.bases.waveform_generator = Number(map.bases.waveform_generator);
        map.bases.noise_generator = Number(map.bases.noise_generator);

        map.offsets.hil_tb = Number(map.offsets.hil_tb);
        map.offsets.controller = Number(map.offsets.controller);
        map.offsets.dma = Number(map.offsets.dma);
        map.offsets.cores_rom = Number(map.offsets.cores_rom);
        map.offsets.cores_inputs = Number(map.offsets.cores_inputs);
        map.offsets.cores_control = Number(map.offsets.cores_control);

        return map;
    }

    public async start_hil(){
        return await this.send_command(commands.core.hil_start, {});
    }

    public async stop_hil(){
        return await this.send_command(commands.core.hil_stop, {});
    }

    public async set_clock(info:clock_info) {
        return await this.send_command(commands.platform.set_pl_clock, info);
    }

    public async get_clock(id:number, is_primary: boolean) : Promise<number>{
        return await this.send_command(commands.platform.get_clock,{is_primary:is_primary, id:id});
    }

    public async compile_program(program:object){
        return await this.send_command(commands.core.compile_program, program);
    }

    public async apply_program(program:number[], core_address:number){
        return await this.send_command(commands.core.apply_program, {address: core_address, program: program})
    }

    public async set_acquisition(arg:acquisition_status){
        return await this.send_command(commands.scope.set_acquisition, arg);
    }

    public async debug_hil(command:object){
        return await this.send_command(commands.core.hil_debug, command);
    }

    public async emulate_hil(spec:object){
        return await this.send_command(commands.core.emulate_hil, spec);
    }

    public async deploy_hil(spec:object){
        return await this.send_command(commands.core.deploy_hil, spec);
    }

    public async hil_hardware_sim(spec:object){
        return await this.send_command(commands.core.hil_hardware_sim, spec);
    }

    public async hil_disassemble(spec:object){
        return await this.send_command(commands.core.hil_disassemble, spec);
    }

    public async select_output(out:select_hil_output){
        return await this.send_command(commands.core.hil_select_out, out);
    }

    public async set_input(in_obj:set_hil_inputs){
        return await this.send_command(commands.core.hil_set_in, in_obj)
    }

    public async apply_filter(taps:number[], filter_address:number){
        return await this.send_command(commands.control.apply_filter, {address:filter_address, taps:taps});
    }


}