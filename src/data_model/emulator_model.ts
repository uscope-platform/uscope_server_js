
export default interface emulator_model {
    id:number,
    name:string,
    cores:object,
    connections:object[],
    n_cycles:number,
    async_multirate:boolean
}


export interface emulator_edit_model {
    id:number,
    field:string,
    value:string
}