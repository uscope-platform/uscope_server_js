

export default interface program_model {
    id:number,
    name:string,
    type:string,
    content:string,
    hex:number[],
    build_settings:object,
    cached_bin_version:string,
    headers:number[]
}
