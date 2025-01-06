
export interface register_write_model {
    address:number,
    value:number,
    type:string,
    proxy_address:number,
    proxy_type:string
}

interface header_info{
    name:string,
    content:string
}

interface io_info {
    address:number,
    associated_io:string,
    name:string,
    type:string,
    common_io:boolean
}

export interface programs_info {
    content:string,
    id:number,
    headers:header_info[],
    io:io_info[],
    type:string
    core_address:number,
    hash:string
}

export type channel_statuses = {
    [key: string]: boolean ;
};


export interface   acquisition_status {
    level:number,
    level_type: string,
    mode: string,
    prescaler: number,
    source: number,
    trigger: string,
    trigger_point: number
}

export interface status_object{
    status:boolean
}

export interface   scope_address {
    address:number,
    dma_buffer_offset: number
}


export interface set_hil_inputs {
    address:number[],
    core:string,
    value:number
}

export interface hil_output {
    address:number,
    channel:number,
    name:string,
    output:string,
    source:string
}

export interface select_hil_output {
    channel: number,
    output: hil_output
}

export interface clock_info {
    id: number,
    value: number,
    is_primary:boolean
}

interface hil_map_bases {
    controller:number,
    cores_control:number,
    cores_inputs:number,
    cores_rom:number,
    hil_control:number
    scope_mux:number
}

interface hil_map_offsets {
    controller:number,
    cores_control:number,
    cores_inputs:number,
    cores_rom:number,
    dma:number,
    hil_tb:number
}

export interface hil_address_map {
    bases: hil_map_bases,
    offsets: hil_map_offsets
}
