

export default class hw_interface {
    private driver_host;
    private driver_port;

    constructor(host: string, port: number) {
        this.driver_host = host;
        this.driver_port = port;

    }

    public async read_data(){

    }
    public async read_register(address:number){

    }
    public async write_register(write_obj:object){

    }

    public async load_bitstream(bit:string){

    }
    public async set_clock_frequency(clock:number, frequency:number) {

    }

    public async set_channel_widths(widths:number[]){}

    public async set_channel_signs(signs:boolean){}

    public async set_scaling_factors(factors:boolean){}

    public async set_channel_status(status:boolean){}

    public async apply_program(program:number[], core_address:number){}

    public async apply_filter(taps:number[], filter_address:number){}

    public async get_version(component:string){}

    public async set_scope_data(scope_data:object){}

    public async deploy_hil(spec:object){}

    public async select_out(spec:object){}

    public async set_in(spec:object){}

    public async start_hil(){}

    public async stop_hil(){}

    public async get_acquisition_status(){}

    public async set_acquisition(arg:object){}


    public async set_scope_address(address:number){}


    public async emulate_hil(spec:object){}

}
