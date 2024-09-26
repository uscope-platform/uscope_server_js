import {
    acquisition_status,
    channel_statuses, clock_info,
    dma_status, hil_address_map,
    scope_address,
    select_hil_output, set_hil_inputs
} from "./data_model/operations_model";


export default class hw_interface {
    private driver_host;
    private driver_port;

    constructor(host: string, port: number) {
        this.driver_host = host;
        this.driver_port = port;

    }

    public async read_data(): Promise<number[]> {
        return [];
    }

    public async read_register(address:number): Promise<number>{
        return 0;
    }
    public async write_register(write_obj:object){

    }

    public async load_bitstream(bit:string){

    }

    public async set_clock(info:clock_info) {

    }

    public async get_clock(id:string, is_primary: boolean) : Promise<number>{
        return 0;
    }

    public async set_scaling_factors(factors:number[]){}

    public async set_channel_status(status:channel_statuses){}

    public async compile_program(program:object){}

    public async apply_program(program:number[], core_address:number){}

    public async apply_filter(taps:number[], filter_address:number){}

    public async get_version(component:string): Promise<string>{
        return ""
    }

    public async deploy_hil(spec:object){}

    public async select_out(spec:object){}

    public async set_in(spec:object){}

    public async start_hil(){}

    public async stop_hil(){}

    public async get_acquisition_status() : Promise<string> {
        return "";
    }

    public async set_acquisition(arg:acquisition_status){}


    public async set_scope_address(address:scope_address){}

    public async set_dma_disable(address:dma_status){}

    public async select_output(out:select_hil_output){}

    public async set_input(in_obj:set_hil_inputs){}

    public async emulate_hil(spec:object){}

    public async set_debug_level(level:string){}

    public async get_debug_level(): Promise<string>{
        return "";
    }

    public async set_hil_address_map(addr_map:hil_address_map){}

    public async get_hil_address_map(): Promise<hil_address_map>{
        return {} as hil_address_map;
    }

    public async disable_scope_dma(status:boolean){}


}
