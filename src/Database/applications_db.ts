import postgres from "postgres";
import {application_model} from "../data_model/application_model";

class applications_db {
    private db: postgres.Sql;
    private schema: string;

    constructor(d: postgres.Sql, schema: string) {
        this.db = d;
        this.schema = schema;
    }

    public async close(): Promise<void>{
        this.db.end();
    }

    public async get_version(): Promise<string> {
        const res = await this.db`
            select version from ${this.db(this.schema)}.data_versions where "table"='Applications'
        `
        return res[0].version;
    }

    public async load_all() : Promise<application_model[]> {
        return this.db<application_model[]>`
            select * from ${this.db(this.schema)}.applications
        `;
    }

    public async get_application(id:number) : Promise<application_model> {
        const res = await this.db<application_model[]>`
            select * from ${this.db(this.schema)}.applications where id=${id}
        `;
        return res[0];
    }

    public async add_application(app:application_model) : Promise<any> {
        return this.upsert_application(app);
    }


    public async update_application_field(app: application_model): Promise<object> {
        return this.upsert_application(app);
    }


    private async upsert_application(app:application_model) : Promise<any> {

        // @ts-ignore
        const res: any = await this.db`
            INSERT INTO ${this.db(this.schema)}.applications (
                id,
                application_name, 
                clock_frequency,
                bitstream,
                channels,
                channel_groups,
                initial_registers_values,
                macro,
                parameters,
                peripherals, 
                miscellaneous, 
                soft_cores, 
                filters,
                programs,
                scripts
            ) values (
                ${app.id},
                ${app.application_name},
                ${app.clock_frequency},
                ${app.bitstream},
                ${app.channels},
                ${app.channel_groups},
                ${app.initial_registers_values},
                ${app.macro},
                ${app.parameters},
                ${app.peripherals},
                ${app.miscellaneous},
                ${app.soft_cores},
                ${app.filters},
                ${app.programs},
                ${app.scripts}
            ) ON CONFLICT DO UPDATE SET
                application_name = EXCLUDED.application_name,
                clock_frequency = EXCLUDED.clock_frequency,
                bitstream = EXCLUDED.bitstream,
                channels = EXCLUDED.channels,
                channel_groups = EXCLUDED.channel_groups,
                initial_registers_values = EXCLUDED.initial_registers_values,
                macro = EXCLUDED.macro,
                parameters = EXCLUDED.parameters,
                peripherals = EXCLUDED.peripherals,
                miscellaneous = EXCLUDED.miscellaneous,
                soft_cores = EXCLUDED.soft_cores,
                filters = EXCLUDED.filters,
                programs = EXCLUDED.programs,
                scripts = EXCLUDED.scripts;   
        `;
    }

    public async remove_application(id:number) : Promise<object> {
        const res = await this.db`
            delete from ${this.db(this.schema)}.applications where id=${id}
        `;
        return res[0];
    }

}

export default applications_db;