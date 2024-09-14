
export default interface register_write_model {
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
    type:string
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