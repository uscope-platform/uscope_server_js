
export default interface bitstream_model {
    id:number,
    name:string,
    data:Buffer | string,
    hash:string
}

export interface bitstream_edit_model {
    id:number,
    field: {
        name:string,
        value:any
    },
    value:string
}