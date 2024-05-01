

export default interface script_model {
    id:number,
    name:string,
    path:string,
    script_content:string,
    triggers:string
}

export interface script_edit_model {
    id:number,
    field:string,
    value:string
}