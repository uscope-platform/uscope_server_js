export interface field_model {
    name: string,
    description: string,
    length:number,
    offset:number,
    order?:number,
    n_fields?:number[]
}

export interface register_model {
    ID:string,
    register_name:string,
    description:string,
    direction:string,
    value:number,
    fields:field_model[],
    offset?:string,
    order?:number,
    n_registers?:number[]
}

export default interface peripheral_model {
    id:number,
    name:string,
    image:string,
    parametric:boolean,
    version:string,
    registers:register_model[]
}

export interface peripheral_edit_model {
    id:number,
    field:string,
    action:string,
    value:any
}