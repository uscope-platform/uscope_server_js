import {application_model} from "#models/application_model";
import {script_model} from "#models/script_model";
import {program_model} from "#models/program_model";
import {filter_model} from "#models/filters_model";
import {emulator_model} from "#models/emulator_model";
import {peripheral_model} from "#models/peripheral_model";
import {bitstream_model} from "#models/bitstreams_model";
import {rpu_model} from "#models/rpu_model";


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
    bitstreams: bitstream_model[],
    rpu_programs: rpu_model[]
}