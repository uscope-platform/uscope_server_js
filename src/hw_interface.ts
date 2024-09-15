import {
    acquisition_status,
    channel_statuses,
    dma_status,
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

    public async set_clock_frequency(clock:number, frequency:number) {

    }

    public async set_channel_widths(widths:number[]){}

    public async set_channel_signs(signs:boolean){}

    public async set_scaling_factors(factors:number[]){}

    public async set_channel_status(status:channel_statuses){}

    public async compile_program(program:object){}

    public async apply_program(program:number[], core_address:number){}

    public async apply_filter(taps:number[], filter_address:number){}

    public async get_version(component:string){}

    public async set_scope_data(scope_data:object){}

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

}
