

export interface program_model {
    id:number,
    name:string,
    type:string,
    content:string,
    hex:number[],
    cached_bin_version:string,
    headers:number[]
}

export interface program_edit_model {
    id:number,
    field:string,
    value:string
}