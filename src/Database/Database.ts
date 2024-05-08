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

const sql = postgres({ max: 4 })

class database {
    public applications:applications_db;
    public scripts: scripts_db;
    public programs: programs_db;
    public filters: filters_db;
    public emulators: emulators_db;
    public peripherals: peripherals_db;
    public platform: platform_db;
    private db: postgres.Sql;


     constructor(host: string, username:string, password:string) {
         this.db = postgres({
             host: host,
             port: 5432,
             database:"uscope",
             username: username,
             password:password
         })

         this.applications = new Applications_db(this.db);
         this.platform = new platform_db(this.db);
         this.scripts = new scripts_db(this.db);
         this.programs = new programs_db(this.db);
         this.filters = new filters_db(this.db);
         this.emulators = new emulators_db(this.db);
         this.peripherals = new peripherals_db(this.db);

     }

    public async init_db(schema_name:string): Promise<void> {
        await this.create_schema(schema_name);
        await this.create_data_versions(schema_name);
        await this.create_stored_procedures(schema_name);
        await this.create_users(schema_name);
        await this.create_tokens(schema_name);
        await this.create_programs(schema_name);
        await this.create_scripts(schema_name);
        await this.create_applications(schema_name);
        await this.create_peripherals(schema_name);
        await this.create_emulators(schema_name);
        await this.create_bitstreams(schema_name);
        await this.create_filters(schema_name);
        await this.populate_versions(schema_name);
    }

    public async populate_versions(schema_name:string):Promise<void> {

        await this.db`
            insert into ${sql(schema_name)}.data_versions("table", version, last_modified) values ('Applications', gen_random_uuid(),CURRENT_TIMESTAMP);
        `
        await this.db`
            insert into ${sql(schema_name)}.data_versions("table", version, last_modified) values ('bitstreams', gen_random_uuid(),CURRENT_TIMESTAMP);
        `
        await this.db`
            insert into ${sql(schema_name)}.data_versions("table", version, last_modified) values ('Peripherals', gen_random_uuid(),CURRENT_TIMESTAMP);
        `
        await this.db`
            insert into ${sql(schema_name)}.data_versions("table", version, last_modified) values ('programs', gen_random_uuid(),CURRENT_TIMESTAMP);
        `
        await this.db`
            insert into ${sql(schema_name)}.data_versions("table", version, last_modified) values ('scripts', gen_random_uuid(),CURRENT_TIMESTAMP);
        `
        await this.db`
            insert into ${sql(schema_name)}.data_versions("table", version, last_modified) values ('filters', gen_random_uuid(),CURRENT_TIMESTAMP);
        `
        await this.db`
            insert into ${sql(schema_name)}.data_versions("table", version, last_modified) values ('emulators', gen_random_uuid(),CURRENT_TIMESTAMP);
        `
    }

    public async create_schema(schema_name:string): Promise<void> {
        const ref = await this.db`
            SELECT schema_name FROM information_schema.schemata WHERE schema_name = ${schema_name};
        `
        if(ref.length === 0){
            await this.db`
                CREATE SCHEMA ${sql(schema_name)} AUTHORIZATION uscope;
            `
            await this.db`
                grant usage on schema ${sql(schema_name)} TO uscope;
            `
            await this.db`
                grant create on schema ${sql(schema_name)} TO uscope;
            `
        }
    }

    public async create_users(schema_name:string): Promise<void> {
         let res = await this.create_table(schema_name, "users")
        if(res){
            await this.db`
                alter table ${sql(schema_name)}.users add username text not null constraint users_pk primary key 
            `
            await this.db`
                alter table ${sql(schema_name)}.users add pw_hash text not null 
            `
            await this.db`
                alter table ${sql(schema_name)}.users add role text not null
            `
            await this.db`
            create unique index users_username_index on ${sql(schema_name)}.users (username);
            `
        }

    }

    public async create_tokens(schema_name:string): Promise<void> {
        let res = await this.create_table(schema_name, "login_tokens")
        if(res){
            await this.db`
                alter table ${sql(schema_name)}.login_tokens add
                    username  text constraint login_tokens_users_username_fk references users on update cascade on delete cascade
            `
            await this.db`
                alter table ${sql(schema_name)}.login_tokens add expiry    timestamp
            `
            await this.db`
                alter table ${sql(schema_name)}.login_tokens add validator text
            `
            await this.db`
            alter table ${sql(schema_name)}.login_tokens add selector  text not null constraint login_tokens_pk primary key
            `
        }

    }

    public async create_programs(schema_name:string): Promise<void> {
        let res = await this.create_table(schema_name, "programs")
        if(res) {
            await this.db`
                alter table ${sql(schema_name)}.programs
                    add id integer not null
                        constraint programs_pk primary key
            `
            await this.db`
                alter table ${sql(schema_name)}.programs
                    add name text
            `
            await this.db`
                alter table ${sql(schema_name)}.programs
                    add content text
            `
            await this.db`
                alter table ${sql(schema_name)}.programs
                    add type text
            `
            await this.db`
                alter table ${sql(schema_name)}.programs
                    add hex bigint[]
            `
            await this.db`
                alter table ${sql(schema_name)}.programs
                    add build_settings jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.programs
                    add cached_bin_version text
            `
            await this.db`
                alter table ${sql(schema_name)}.programs
                    add headers integer[]
            `
            await this.db`
                create unique index programs_id_uindex
                    on ${sql(schema_name)}.programs (id);
            `
            await this.db`
                create trigger bump_programs_version after insert or delete or update on ${sql(schema_name)}.programs execute procedure ${sql(schema_name)}.update_version('programs');
            `
        }
    }

    public async create_scripts(schema_name:string): Promise<void> {
        let res = await this.create_table(schema_name, "scripts")
        if(res) {
            await this.db`
                alter table ${sql(schema_name)}.scripts
                    add id integer not null
                        constraint scripts_pk primary key
            `
            await this.db`
                alter table ${sql(schema_name)}.scripts
                    add name text
            `
            await this.db`
                alter table ${sql(schema_name)}.scripts
                    add path text
            `
            await this.db`
                alter table ${sql(schema_name)}.scripts
                    add content text
            `
            await this.db`
                alter table ${sql(schema_name)}.scripts
                    add triggers text
            `
            await this.db`
                create unique index scripts_id_index on ${sql(schema_name)}.scripts (id);
            `
            await this.db`
            create trigger bump_scripts_version after insert or delete or update on ${sql(schema_name)}.scripts execute procedure ${sql(schema_name)}.update_version('scripts');
            `
        }
    }

    public async create_data_versions(schema_name:string): Promise<void> {
        let res = await this.create_table(schema_name, "data_versions")
        if(res) {
            await this.db`
                alter table ${sql(schema_name)}.data_versions
                    add ${sql("table")} text not null constraint data_versions_pk primary key
            `
            await this.db`
                alter table ${sql(schema_name)}.data_versions
                    add version       uuid
            `
            await this.db`
                alter table ${sql(schema_name)}.data_versions
                    add last_modified timestamp
            `
            await this.db`
                create unique index data_versions_table_index on ${sql(schema_name)}.data_versions ("table");
            `
            await this.db`
                create unique index data_versions_version_uindex on ${sql(schema_name)}.data_versions (version);
            `
        }
    }

    public async create_applications(schema_name:string): Promise<void> {
        let res = await this.create_table(schema_name, "applications")
        if(res) {

            await this.db`
                alter table ${sql(schema_name)}.applications
                    add application_name text not null
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add bitstream text
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add clock_frequency bigint default 100000000
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add channels jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add channel_groups jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add initial_registers_values jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add macro jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add parameters jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add peripherals jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add miscellaneous jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add soft_cores jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add filters jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add programs text[]
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add scripts text[]
            `
            await this.db`
                alter table ${sql(schema_name)}.applications
                    add id serial constraint applications_pk primary key
            `
            await this.db`
                create unique index applications_application_name_index on ${sql(schema_name)}.applications (application_name);
            `
            await this.db`
                create trigger bump_application_version after insert or delete or update on ${sql(schema_name)}.applications execute procedure ${sql(schema_name)}.update_version('Applications')
            `
        }
    }

    public async create_bitstreams(schema_name:string): Promise<void> {
        let res = await this.create_table(schema_name, "bitstreams")
        if(res) {
            await this.db`
                alter table ${sql(schema_name)}.bitstreams
                    add id integer not null
            `
            await this.db`
                alter table ${sql(schema_name)}.bitstreams
                    add path text    not null
            `
            await this.db`
                create unique index bitstreams_id_index on ${sql(schema_name)}.bitstreams (id);
            `
            await this.db`
                create trigger bump_bitstreams_version after insert or delete or update on ${sql(schema_name)}.bitstreams execute procedure ${sql(schema_name)}.update_version('bitstreams');
            `
        }
    }

    public async create_filters(schema_name:string): Promise<void> {
        let res = await this.create_table(schema_name, "filters")
        if(res) {
            await this.db`
                alter table ${sql(schema_name)}.filters
                    add id integer not null
                        constraint filters_pk primary key
            `
            await this.db`
                alter table ${sql(schema_name)}.filters
                    add name text
            `
            await this.db`
                alter table ${sql(schema_name)}.filters
                    add parameters jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.filters
                    add ideal_taps double precision[]
            `
            await this.db`
                alter table ${sql(schema_name)}.filters
                    add quantized_taps  integer[]
            `
            await this.db`
            create trigger bump_filters_version after insert or delete or update on ${sql(schema_name)}.filters execute procedure ${sql(schema_name)}.update_version('filters');
            `
        }
    }

    public async create_emulators(schema_name:string): Promise<void> {
        let res = await this.create_table(schema_name, "emulators")
        if(res) {
            await this.db`
                alter table ${sql(schema_name)}.emulators
                    add id integer not null constraint emulators_pk primary key
            `
            await this.db`
                alter table ${sql(schema_name)}.emulators
                    add name text
            `
            await this.db`
                alter table ${sql(schema_name)}.emulators
                    add cores       jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.emulators
                    add connections jsonb[]
            `
            await this.db`
                alter table ${sql(schema_name)}.emulators
                    add n_cycles    integer
            `
            await this.db`
            create trigger bump_emulators_version after insert or delete or update on ${sql(schema_name)}.emulators execute procedure ${sql(schema_name)}.update_version('emulators');
            `
        }
    }


    public async create_peripherals(schema_name:string): Promise<void> {
        let res = await this.create_table(schema_name, "peripherals")
        if(res) {
            await this.db`
                alter table ${sql(schema_name)}.peripherals
                    add  name text not null
            `
            await this.db`
                alter table ${sql(schema_name)}.peripherals
                    add image text
            `
            await this.db`
                alter table ${sql(schema_name)}.peripherals
                    add parametric boolean default false not null
            `
            await this.db`
                alter table ${sql(schema_name)}.peripherals
                    add version text
            `
            await this.db`
                alter table ${sql(schema_name)}.peripherals
                    add registers jsonb
            `
            await this.db`
                alter table ${sql(schema_name)}.peripherals
                    add id serial constraint peripherals_pk primary key
            `
            await this.db`
                create unique index peripherals_name_index on ${sql(schema_name)}.peripherals (name);
            `
            await this.db`
                create trigger bump_peripherals_version after insert or delete or update on ${sql(schema_name)}.peripherals execute procedure ${sql(schema_name)}.update_version('Peripherals');
            `
        }
    }

    public async create_stored_procedures(schema_name:string): Promise<void>{
        try {
            let res = await this.db`
            select pg_get_functiondef('${sql(schema_name)}.update_version()'::regprocedure);
         `
        } catch (err){
            await this.db`
            create function ${sql(schema_name)}.update_version() returns trigger as $$ begin
            insert into ${sql(schema_name)}.data_versions("table", version, last_modified) values (TG_ARGV[0], gen_random_uuid(),CURRENT_TIMESTAMP)
            on conflict("table") do update set version=excluded.version, last_modified=excluded.last_modified;
            return new;
            end;
            $$ language plpgsql;
         `
        }
        return
    }


    public async create_table(schema_name:string, tab_name:string): Promise<boolean> {
        const ref = await this.db`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE  table_schema = ${schema_name}
                  AND    table_name   = ${tab_name}
            );
        `
        if(!ref[0].exists){
            await this.db`
                create table ${sql(schema_name)}.${sql(tab_name)}();
            `
            await this.db`
                alter table ${sql(schema_name)}.${sql(tab_name)} owner to uscope;
            `
        }
        return !ref[0].exists;
    }
}


export default database;