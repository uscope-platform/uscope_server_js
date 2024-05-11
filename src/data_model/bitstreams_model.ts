
export default interface bitstream_model {
    id:number,
    path:string,
    data:Buffer,
    hash:string
}

export interface bitstream_edit_model {
    id:number,
    field:string,
    value:string
}