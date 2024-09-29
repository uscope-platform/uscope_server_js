import {application_model} from "./application_model";
import script_model from "./script_model";
import program_model from "./program_model";
import filter_model from "./filters_model";
import emulator_model from "./emulator_model";
import peripheral_model from "./peripheral_model";
import bitstream_model from "./bitstreams_model";


export interface user_model {
    username:string,
    pw_hash:string,
    role:string
}

export interface user_login_object {
    user: string,
    password: string,
    remember_me: boolean
    login_type: "user"
}

export interface auto_login_object {
    expiry: string,
    validator: string,
    selector: string
    login_type: "automated"
}

export interface auth_response {
    access_token: string,
    login_token: auto_login_object,
    role: string
}

export interface db_dump {
    applications: application_model[],
    scripts: script_model[],
    programs: program_model[],
    filters: filter_model[],
    emulators: emulator_model[],
    peripherals: peripheral_model[],
    bitstreams: bitstream_model[]
}