

export interface application_model {
    [index: string]: any;
    id:number
    application_name:string
    clock_frequency:number,
    bitstream:string,
    channels:object,
    channel_groups:object,
    initial_registers_values:object,
    macro:object,
    parameters:object,
    peripherals:object,
    miscellaneous: {
        [index: string]: any;
    },
    soft_cores:object[],
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

export interface application_edit_model {
    application:number,
    item:any,
    action:string,
    object:string
}