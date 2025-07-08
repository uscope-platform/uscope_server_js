
export enum fcore_comparator_type {
    no_comparator = "none",
    reducing_comparator = "reducing",
    full_comparator = "full"
}

export enum efi_implementation_type {
    efi_none = "efi_none",
    efi_trig = "efi_trig",
    efi_sort = "efi_sort"
}

export interface core_options_model {
    comparators:fcore_comparator_type,
    efi_implementation:efi_implementation_type
}

export interface core_deployment_options{
    rom_address:number,
    control_address:number,
    has_reciprocal:boolean
}

export interface core_input_metadata{
    type:string,
    width:number,
    signed:boolean,
    common_io:boolean
}

export interface core_input_source{
    type:string,
    value:any,
    file:any,
    series:any
}

export interface core_output_metadata{
    type:string,
    width:number,
    signed:boolean
}

export interface core_input{
    reg_n: number[],
    channel:number,
    metadata: core_input_metadata,
    name:string,
    source:core_input_source
}

export interface core_output{
    name:string,
    reg_n: number[],
    metadata:core_output_metadata
}

export interface core_memory{
    name:string,
    reg_n: number[],
    metadata:core_output_metadata,
    value:any
}

export interface core_input_data{
    name:string,
    data:any
}

export interface core_model {
    name: string,
    id: number,
    order:number,
    program: string,
    channels:number,
    inputs:core_input[],
    input_data:core_input_data[],
    outputs:core_output[],
    memory_init:core_memory[],
    options:core_options_model,
    sampling_frequency:number,
    deployment:core_deployment_options
}
export interface port_link_model{
    id: number,
    source_port:string,
    destination_port:string
}
export interface connection_model {
    source_core:string,
    destination_core:string,
    ports: port_link_model[]
}


export interface hil_debug_model {
    action:string,
    arguments:any
}


export interface emulator_model {
    id:number,
    name:string,
    cores:{
        [key:string]: core_model
    },
    connections:connection_model[],
    emulation_time:number,
    deployment_mode:boolean
}


export interface emulator_edit_model {
    id:number,
    field:string,
    action:string,
    value:any
}

