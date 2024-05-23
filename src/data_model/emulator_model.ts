
export default interface emulator_model {
    id:number,
    name:string,
    cores:object,
    connections:object[],
    emulation_time:number
}


export interface emulator_edit_model {
    id:number,
    field:string,
    value:string
}