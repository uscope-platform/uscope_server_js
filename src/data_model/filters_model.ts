

export interface filter_model {
    id:number,
    name:string,
    parameters:object,
    ideal_taps:number[],
    quantized_taps:number[]
}


export interface filter_edit_model {
    id:number,
    field:string,
    value:string
}


export interface filter_apply_model {
    id:number,
    address:number
}
