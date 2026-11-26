
export interface rpu_model {
    id:number,
    name:string,
    core:number,
    data:Buffer,
    hash:string
}

export interface rpu_edit_model {
    id:number,
    field: {
        name:string,
        value:any
    },
    value:string
}