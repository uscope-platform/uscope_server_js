
export default interface bitstream_model {
    id:number,
    path:string,
    data:Buffer
}

export interface bitstream_edit_model {
    id:number,
    field:string,
    value:string
}