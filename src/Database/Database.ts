import postgres from "postgres";

import {
    bitstreams_db, applications_db, peripherals_db,
    platform_db, emulators_db, filters_db, scripts_db,
    programs_db
} from ".";
import {db_dump} from "#models"

const sql = postgres({ max: 4 })

type columns_map = {[column: string]: {type: string, default: string | null, is_serial: boolean}};

export class database {
    public applications:applications_db;
    public scripts: scripts_db;
    public programs: programs_db;
    public filters: filters_db;
    public emulators: emulators_db;
    public peripherals: peripherals_db;
    public bitstreams: bitstreams_db;
    public platform: platform_db;
    db: postgres.Sql;
    private readonly schema: string;
    private readonly host: string;
    private readonly username: string;
    private readonly password: string;


     constructor(host: string, username:string, password:string, schema:string) {
         this.host = host;
         this.username = username;
         this.password = password;
         this.db = postgres({
             host: host,
             port: 5432,
             database:"uscope",
             username: username,
             password:password
         })

         this.schema = schema;

         this.applications = new applications_db(this.db, schema);
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
         for(let app of obj.applications) await this.applications.add_application(app);
         for(let flt of obj.filters) await this.filters.add_filter(flt);
         for(let scr of obj.scripts) await this.scripts.add_script(scr);
         for(let per of obj.peripherals) await this.peripherals.add_peripheral(per);
         for(let prg of obj.programs) await this.programs.add_program(prg);
         for(let emu of obj.emulators) await this.emulators.add_emulator(emu);
         for(let bit of obj.bitstreams) await this.bitstreams.add_bitstream(bit);
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
        let db_exists = await this.check_db_existance();
        if(!db_exists){
            console.log("DATABASE UNINITIALIZED, PROCEDING WITH INITIALIZATION");
            await this.create_tables();
        } else {
            await this.migrate();
        }
    }

    private async create_tables(): Promise<void> {
        await this.create_schema();
        await this.create_missing_tables();
        await this.populate_versions();
    }

    // every create_* method leaves an already existing table untouched
    private async create_missing_tables(): Promise<void> {
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
    }

    // Brings an existing database to the schema described by the create_* methods.
    // The expected schema is built by those same methods in a scratch schema inside a transaction
    // that is always rolled back: nothing is dropped, and a pre-existing schema with the same
    // name makes the creation fail instead of being overwritten.
    // Handled: missing tables, missing columns, columns no longer in the schema, changed
    // column types and defaults. Not handled: constraints, indexes and triggers of existing tables.
    // A renamed column is a drop plus an add, so its content is lost.
    private async migrate(): Promise<void> {
        await this.create_missing_tables();

        const expected = await this.read_expected_columns();
        const current = await this.read_columns(this.db, this.schema);

        for(const table of Object.keys(expected)) {
            await this.migrate_table(table, expected[table], current[table] ?? {});
        }
        for(const table of Object.keys(current)) {
            if(!(table in expected)) console.log(`MIGRATION: table ${table} is not in the schema anymore, leaving it untouched`);
        }
        await this.populate_versions();
    }

    private async read_expected_columns(): Promise<{[table: string]: columns_map}> {
        const rollback = new Error("rollback of the scratch schema");
        let expected: {[table: string]: columns_map} = {};
        try {
            await this.db.begin(async (tx) => {
                const scratch = new database(this.host, this.username, this.password, `${this.schema}_migration_scratch`);
                scratch.db = tx as unknown as postgres.Sql;
                await scratch.create_tables();
                expected = await this.read_columns(tx as unknown as postgres.Sql, scratch.schema);
                throw rollback;
            });
        } catch(err) {
            if(err !== rollback) throw err;
        }
        return expected;
    }

    private async migrate_table(table: string, expected: columns_map, current: columns_map): Promise<void> {
        // types and defaults come from the catalog of the scratch schema, identifiers are quoted
        const q = (id: string) => `"${id.replace(/"/g, '""')}"`;
        const tab = `${q(this.schema)}.${q(table)}`;

        for(const [name, col] of Object.entries(expected)) {
            const cur = current[name];
            const column = q(name);
            if(!cur) {
                console.log(`MIGRATION: adding column ${table}.${name}`);
                const type = col.is_serial ? "serial" : col.type;
                const def = col.default !== null ? ` default ${col.default}` : "";
                await this.db.unsafe(`alter table ${tab} add column ${column} ${type}${def}`);
            } else if(col.is_serial) {
                continue;
            } else if(cur.type !== col.type) {
                console.log(`MIGRATION: changing type of ${table}.${name} from ${cur.type} to ${col.type}`);
                await this.db.unsafe(`alter table ${tab} alter column ${column} drop default`);
                await this.db.unsafe(`alter table ${tab} alter column ${column} type ${col.type} using ${column}::${col.type}`);
                if(col.default !== null) await this.db.unsafe(`alter table ${tab} alter column ${column} set default ${col.default}`);
            } else if(cur.default !== col.default) {
                console.log(`MIGRATION: changing default of ${table}.${name}`);
                if(col.default === null) await this.db.unsafe(`alter table ${tab} alter column ${column} drop default`);
                else await this.db.unsafe(`alter table ${tab} alter column ${column} set default ${col.default}`);
            }
        }
        for(const name of Object.keys(current)) {
            if(!(name in expected)) {
                console.log(`MIGRATION: dropping column ${table}.${name}`);
                await this.db.unsafe(`alter table ${tab} drop column ${q(name)} cascade`);
            }
        }
    }

    private async read_columns(db: postgres.Sql, schema: string): Promise<{[table: string]: columns_map}> {
        const rows = await db`
            select c.relname as table_name, a.attname as column_name,
                   format_type(a.atttypid, a.atttypmod) as type,
                   pg_get_expr(d.adbin, d.adrelid) as default_value
            from pg_attribute a
                join pg_class c on c.oid = a.attrelid
                join pg_namespace n on n.oid = c.relnamespace
                left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
            where n.nspname = ${schema} and c.relkind = 'r' and a.attnum > 0 and not a.attisdropped
        `
        const res: {[table: string]: columns_map} = {};
        for(const row of rows) {
            const is_serial = typeof row.default_value === "string" && row.default_value.startsWith("nextval(");
            res[row.table_name] ??= {};
            res[row.table_name][row.column_name] = {
                type: row.type,
                default: is_serial ? null : row.default_value,
                is_serial: is_serial
            };
        }
        return res;
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

    private async check_db_existance():Promise<boolean>{
         let resp = await this.db`
         SELECT schema_name FROM information_schema.schemata WHERE schema_name = ${this.schema};
         `
        return resp.length !== 0;
    }

    public async create_schema(): Promise<void> {
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
                    add init_script integer
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
                    add name text    not null
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
                    add connections jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.emulators
                    add io_blocks jsonb default '{}'::jsonb
            `
            await this.db`
                alter table ${sql(this.schema)}.emulators
                    add layout jsonb default '{}'::jsonb
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
        await this.db`
            create or replace function ${sql(this.schema)}.update_version() returns trigger as $$ begin
            insert into ${sql(this.schema)}.data_versions("table", version, last_modified) values (TG_ARGV[0], gen_random_uuid(),CURRENT_TIMESTAMP)
            on conflict("table") do update set version=excluded.version, last_modified=excluded.last_modified;
            return new;
            end;
            $$ language plpgsql;
        `
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
