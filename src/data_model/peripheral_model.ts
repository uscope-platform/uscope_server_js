

export default interface peripheral_model {
    id:number,
    name:string,
    image:string,
    parametric:boolean,
    version:string,
    registers:object
}


export interface peripheral_edit_model {
    id:number,
    field:string,
    value:string
}