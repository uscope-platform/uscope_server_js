import postgres from "postgres";

import applications_db from "./applications_db";
import platform_db from "./platform_db";
import scripts_db from "./scripts_db";
import programs_db from "./programs_db";
import filters_db from "./filters_db";
import emulators_db from "./emulators_db";
import peripherals_db from "./peripherals_db";
import Applications_db from "./applications_db";
import {promises} from "node:dns";
import bitstreams_db from "./bitstreams_db";
import {db_dump} from "../data_model/platform_model";

const sql = postgres({ max: 4 })

class database {
    public applications:applications_db;
    public scripts: scripts_db;
    public programs: programs_db;
    public filters: filters_db;
    public emulators: emulators_db;
    public peripherals: peripherals_db;
    public bitstreams: bitstreams_db;
    public platform: platform_db;
    db: postgres.Sql;
    private schema: string;


     constructor(host: string, username:string, password:string, schema:string) {
         this.db = postgres({
             host: host,
             port: 5432,
             database:"uscope",
             username: username,
             password:password
         })
         this.schema = schema;

         this.applications = new Applications_db(this.db, schema);
         this.platform = new platform_db(this.db, schema);
         this.scripts = new scripts_db(this.db, schema);
         this.programs = new programs_db(this.db, schema);
         this.filters = new filters_db(this.db, schema);
         this.emulators = new emulators_db(this.db, schema);
         this.peripherals = new peripherals_db(this.db, schema);
         this.bitstreams = new bitstreams_db(this.db, schema);
     }

     public async dump():Promise<db_dump>{
        return {
            applications: await this.applications.load_all(),
            filters: await this.filters.load_all(),
            scripts: await this.scripts.load_all(),
            programs: await this.programs.load_all(),
            peripherals: await this.peripherals.load_all(),
            emulators: await this.emulators.load_all(),
            bitstreams: await this.bitstreams.load_all()
        }
     }

     public async restore(obj:db_dump):Promise<any>{
        // TODO: implement db restore
     }

     public async close():Promise<void> {
         await this.db.end();
         await this.applications.close();
         await this.peripherals.close();
         await this.platform.close();
         await this.scripts.close();
         await this.programs.close();
         await this.emulators.close();
         return
     }

    public async init_db(): Promise<void> {
        await this.create_schema();
        await this.create_data_versions();
        await this.create_stored_procedures();
        await this.create_users();
        await this.create_tokens();
        await this.create_programs();
        await this.create_scripts();
        await this.create_applications();
        await this.create_peripherals();
        await this.create_emulators();
        await this.create_bitstreams();
        await this.create_filters();
        await this.populate_versions();
    }

    public async populate_versions():Promise<void> {

        await this.add_version("Applications");
        await this.add_version("bitstreams");
        await this.add_version("Peripherals");
        await this.add_version("programs");
        await this.add_version("scripts");
        await this.add_version("filters");
        await this.add_version("emulators");

    }

    public async create_schema(): Promise<void> {
        const ref = await this.db`
            SELECT schema_name FROM information_schema.schemata WHERE schema_name = ${this.schema};
        `
        if(ref.length === 0){
            await this.db`
                CREATE SCHEMA ${sql(this.schema)} AUTHORIZATION uscope;
            `
            await this.db`
                grant usage on schema ${sql(this.schema)} TO uscope;
            `
            await this.db`
                grant create on schema ${sql(this.schema)} TO uscope;
            `
        }
    }

    public async create_users(): Promise<void> {
         let res = await this.create_table( "users")
        if(res){
            await this.db`
                alter table ${sql(this.schema)}.users add username text not null constraint users_pk primary key 
            `
            await this.db`
                alter table ${sql(this.schema)}.users add pw_hash text not null 
            `
            await this.db`
                alter table ${sql(this.schema)}.users add role text not null
            `
            await this.db`
            create unique index users_username_index on ${sql(this.schema)}.users (username);
            `
        }

    }

    public async create_tokens(): Promise<void> {
        let res = await this.create_table( "login_tokens")
        if(res){
            await this.db`
                alter table ${sql(this.schema)}.login_tokens add
                    username  text constraint login_tokens_users_username_fk references ${sql(this.schema)}.users on update cascade on delete cascade
            `
            await this.db`
                alter table ${sql(this.schema)}.login_tokens add expiry    timestamp
            `
            await this.db`
                alter table ${sql(this.schema)}.login_tokens add validator text
            `
            await this.db`
            alter table ${sql(this.schema)}.login_tokens add selector  text not null constraint login_tokens_pk primary key
            `
        }

    }

    public async create_programs(): Promise<void> {
        let res = await this.create_table( "programs")
        if(res) {
            await this.db`
                alter table ${sql(this.schema)}.programs
                    add id integer not null
                        constraint programs_pk primary key
            `
            await this.db`
                alter table ${sql(this.schema)}.programs
                    add name text
            `
            await this.db`
                alter table ${sql(this.schema)}.programs
                    add content text
            `
            await this.db`
                alter table ${sql(this.schema)}.programs
                    add type text
            `
            await this.db`
                alter table ${sql(this.schema)}.programs
                    add hex bigint[]
            `
            await this.db`
                alter table ${sql(this.schema)}.programs
                    add build_settings jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.programs
                    add cached_bin_version text
            `
            await this.db`
                alter table ${sql(this.schema)}.programs
                    add headers integer[]
            `
            await this.db`
                create unique index programs_id_uindex
                    on ${sql(this.schema)}.programs (id);
            `
            await this.db`
                create trigger bump_programs_version after insert or delete or update on ${sql(this.schema)}.programs execute procedure ${sql(this.schema)}.update_version('programs');
            `
        }
    }

    public async create_scripts(): Promise<void> {
        let res = await this.create_table( "scripts")
        if(res) {
            await this.db`
                alter table ${sql(this.schema)}.scripts
                    add id integer not null
                        constraint scripts_pk primary key
            `
            await this.db`
                alter table ${sql(this.schema)}.scripts
                    add name text
            `
            await this.db`
                alter table ${sql(this.schema)}.scripts
                    add path text
            `
            await this.db`
                alter table ${sql(this.schema)}.scripts
                    add content text
            `
            await this.db`
                alter table ${sql(this.schema)}.scripts
                    add triggers text
            `
            await this.db`
                create unique index scripts_id_index on ${sql(this.schema)}.scripts (id);
            `
            await this.db`
            create trigger bump_scripts_version after insert or delete or update on ${sql(this.schema)}.scripts execute procedure ${sql(this.schema)}.update_version('scripts');
            `
        }
    }

    public async create_data_versions(): Promise<void> {
        let res = await this.create_table( "data_versions")
        if(res) {
            await this.db`
                alter table ${sql(this.schema)}.data_versions
                    add ${sql("table")} text not null constraint data_versions_pk primary key
            `
            await this.db`
                alter table ${sql(this.schema)}.data_versions
                    add version       uuid
            `
            await this.db`
                alter table ${sql(this.schema)}.data_versions
                    add last_modified timestamp
            `
            await this.db`
                create unique index data_versions_table_index on ${sql(this.schema)}.data_versions ("table");
            `
            await this.db`
                create unique index data_versions_version_uindex on ${sql(this.schema)}.data_versions (version);
            `
        }
    }

    public async create_applications(): Promise<void> {
        let res = await this.create_table( "applications")
        if(res) {

            await this.db`
                alter table ${sql(this.schema)}.applications
                    add application_name text not null
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add bitstream text
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add clock_frequency bigint default 100000000
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add channels jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add channel_groups jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add initial_registers_values jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add macro jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add parameters jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add peripherals jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add miscellaneous jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add soft_cores jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add filters jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add programs text[]
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add scripts text[]
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add id serial constraint applications_pk primary key
            `
            await this.db`
                alter table ${sql(this.schema)}.applications
                    add pl_clocks jsonb default '{"0": 100000000, "1": 100000000, "2": 100000000, "3": 100000000}'::jsonb;
            `
            await this.db`
                create unique index applications_application_name_index on ${sql(this.schema)}.applications (application_name);
            `
            await this.db`
                create trigger bump_application_version after insert or delete or update on ${sql(this.schema)}.applications execute procedure ${sql(this.schema)}.update_version('Applications')
            `
        }
    }

    public async create_bitstreams(): Promise<void> {
        let res = await this.create_table( "bitstreams")
        if(res) {
            await this.db`
                alter table ${sql(this.schema)}.bitstreams
                    add id integer not null
            `
            await this.db`
                alter table ${sql(this.schema)}.bitstreams
                    add path text    not null
            `
            await this.db`
                alter table ${sql(this.schema)}.bitstreams
                    add data bytea
            `

            await this.db`
                alter table ${sql(this.schema)}.bitstreams
                    add hash text;
            `

            await this.db`
                create unique index bitstreams_id_index on ${sql(this.schema)}.bitstreams (id);
            `
            await this.db`
                create trigger bump_bitstreams_version after insert or delete or update on ${sql(this.schema)}.bitstreams execute procedure ${sql(this.schema)}.update_version('bitstreams');
            `
        }
    }

    public async create_filters(): Promise<void> {
        let res = await this.create_table( "filters")
        if(res) {
            await this.db`
                alter table ${sql(this.schema)}.filters
                    add id integer not null
                        constraint filters_pk primary key
            `
            await this.db`
                alter table ${sql(this.schema)}.filters
                    add name text
            `
            await this.db`
                alter table ${sql(this.schema)}.filters
                    add parameters jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.filters
                    add ideal_taps double precision[]
            `
            await this.db`
                alter table ${sql(this.schema)}.filters
                    add quantized_taps  integer[]
            `
            await this.db`
            create trigger bump_filters_version after insert or delete or update on ${sql(this.schema)}.filters execute procedure ${sql(this.schema)}.update_version('filters');
            `
        }
    }

    public async create_emulators(): Promise<void> {
        let res = await this.create_table( "emulators")
        if(res) {
            await this.db`
                alter table ${sql(this.schema)}.emulators
                    add id integer not null constraint emulators_pk primary key
            `
            await this.db`
                alter table ${sql(this.schema)}.emulators
                    add name text
            `
            await this.db`
                alter table ${sql(this.schema)}.emulators
                    add cores       jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.emulators
                    add connections jsonb[]
            `
            await this.db`
                alter table ${sql(this.schema)}.emulators
                    add emulation_time double precision;
            `
            await this.db`
                alter table ${sql(this.schema)}.emulators
                    add deployment_mode boolean default false;
            `
            await this.db`
                create trigger bump_emulators_version after insert or delete or update on ${sql(this.schema)}.emulators execute procedure ${sql(this.schema)}.update_version('emulators');
            `
        }
    }

    public async create_peripherals(): Promise<void> {
        let res = await this.create_table( "peripherals")
        if(res) {
            await this.db`
                alter table ${sql(this.schema)}.peripherals
                    add  name text not null
            `
            await this.db`
                alter table ${sql(this.schema)}.peripherals
                    add image text
            `
            await this.db`
                alter table ${sql(this.schema)}.peripherals
                    add parametric boolean default false not null
            `
            await this.db`
                alter table ${sql(this.schema)}.peripherals
                    add version text
            `
            await this.db`
                alter table ${sql(this.schema)}.peripherals
                    add registers jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.peripherals
                    add id serial constraint peripherals_pk primary key
            `
            await this.db`
                create unique index peripherals_name_index on ${sql(this.schema)}.peripherals (name);
            `
            await this.db`
                create trigger bump_peripherals_version after insert or delete or update on ${sql(this.schema)}.peripherals execute procedure ${sql(this.schema)}.update_version('Peripherals');
            `
        }
    }

    public async create_stored_procedures(): Promise<void>{
        try {
            let res = await this.db`
            select pg_get_functiondef('${sql(this.schema)}.update_version()'::regprocedure);
         `
        } catch (err){
            await this.db`
            create function ${sql(this.schema)}.update_version() returns trigger as $$ begin
            insert into ${sql(this.schema)}.data_versions("table", version, last_modified) values (TG_ARGV[0], gen_random_uuid(),CURRENT_TIMESTAMP)
            on conflict("table") do update set version=excluded.version, last_modified=excluded.last_modified;
            return new;
            end;
            $$ language plpgsql;
         `
        }
        return
    }

    public async delete_database():Promise<void>{
        await this.db`
                drop schema ${sql(this.schema)} cascade;
            `
    }

    public async create_table( tab_name:string): Promise<boolean> {
        const ref = await this.db`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE  table_schema = ${this.schema}
                  AND    table_name   = ${tab_name}
            );
        `
        if(!ref[0].exists){
            await this.db`
                create table ${sql(this.schema)}.${sql(tab_name)}();
            `
            await this.db`
                alter table ${sql(this.schema)}.${sql(tab_name)} owner to uscope;
            `
        }
        return !ref[0].exists;
    }

    private async add_version( table_name:string):Promise<any>{
        let res = await this.db`
            select version from ${sql(this.schema)}.data_versions where "table" = ${table_name}
         `

        if(res.length==0){
            await this.db`
                insert into ${sql(this.schema)}.data_versions("table", version, last_modified) values (${table_name}, gen_random_uuid(),CURRENT_TIMESTAMP);
            `
        }
    }
}


export default database;