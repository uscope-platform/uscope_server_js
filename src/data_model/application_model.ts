

export interface application_model {
    id:number
    application_name:string
    clock_frequency:number
    bitstream:string,
    channels:object,
    channel_groups:object,
    initial_registers_values:object,
    macro:object,
    parameters:object,
    peripherals:object,
    miscellaneous:object,
    soft_cores:object,
    filters:object,
    programs: number[],
    scripts: number[]
}