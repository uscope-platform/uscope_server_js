

export interface application_model {
    [index: string]: any;
    id:number
    application_name:string
    clock_frequency:number,
    bitstream:string,
    channels:object,
    channel_groups:object,
    initial_registers_values:initial_register_value[],
    macro:object,
    parameters:object,
    peripherals:object,
    miscellaneous: {
        [index: string]: any;
    },
    soft_cores:core_load_info[],
    filters:object,
    programs: number[],
    scripts: number[],
    pl_clocks:{
        [index: string]: any;
        "0":number,
        "1":number,
        "2":number,
        "3":number,
    }
}

export interface initial_register_value{
    address:number,
    value:number
}

export interface core_load_info{
    id: string,
    address: number
    default_program: string,
    io: core_dma_info[]
}

export interface core_dma_info{
    name: string,
    type:string,
    address: number,
    associated_io:string
}


export interface application_edit_model {
    application:number,
    item:any,
    action:string,
    object:string
}