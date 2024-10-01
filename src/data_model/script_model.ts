

export default interface script_model {
    id:number,
    name:string,
    path:string,
    content:string,
    triggers:string
}

export interface script_edit_model {
    id:number,
    field:string,
    value:string
}