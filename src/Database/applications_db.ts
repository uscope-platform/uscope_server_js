import postgres from "postgres";
import {application_model} from "#models";

export class applications_db {
    private readonly db: postgres.Sql;
    private readonly schema: string;

    constructor(d: postgres.Sql, schema: string) {
        this.db = d;
        this.schema = schema;
    }

    public async close(): Promise<void>{
        await this.db.end();
    }

    public async get_version(): Promise<string> {
        const res = await this.db`
            select version from ${this.db(this.schema)}.data_versions where "table"='Applications'
        `
        return res[0].version;
    }

    public async load_all() : Promise<application_model[]> {
        let res = await this.db`
            select * from ${this.db(this.schema)}.applications
        `;

        return <application_model[]><unknown>res.map((app)=>{
             if (typeof app.clock_frequency === "string") {
                 app.clock_frequency = parseInt(app.clock_frequency)
             }
            return app;
        })
    }

    public async get_application(id:number) : Promise<application_model> {
        const res = await this.db`
            select * from ${this.db(this.schema)}.applications where id=${id}
        `;

        res[0].clock_frequency = parseInt(res[0].clock_frequency)
        return <application_model>res[0];
    }

    public async add_application(app:application_model) : Promise<any> {
        return this.upsert_application(app);
    }


    public async update_application_field(app: application_model): Promise<object> {
        return this.upsert_application(app);
    }


    private async upsert_application(app:application_model) : Promise<any> {

        // @ts-ignore
        await this.db`
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
                scripts,
                pl_clocks
            ) values (
                ${app.id},
                ${app.application_name},
                ${0},
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
                ${app.scripts},
                ${app.pl_clocks}
            ) ON CONFLICT(id) DO UPDATE SET
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
                scripts = EXCLUDED.scripts,
                pl_clocks = EXCLUDED.pl_clocks
        `;
    }

    public async remove_application(id:number) : Promise<object> {
        const res = await this.db`
            delete from ${this.db(this.schema)}.applications where id=${id}
        `;
        return res[0];
    }

    public async application_exists(id:number) : Promise<boolean> {
        let res = await this.db`
            SELECT EXISTS(SELECT 1 FROM ${this.db(this.schema)}.applications WHERE id=${id})
        `
        return res[0].exists;
    }
}
