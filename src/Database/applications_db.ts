import postgres from "postgres";
import {application_model} from "../data_model/application_model";

class applications_db {
    private db: postgres.Sql;

    constructor(d: postgres.Sql) {
        this.db = d;
    }

    public async get_version(): Promise<string> {
        const res = await this.db`
            select version from uscope.data_versions where "table"='Applications'
        `
        return res[0].version;
    }

    public async load_all() : Promise<application_model[]> {
        return this.db<application_model[]>`
            select * from uscope.applications
        `;
    }

    public async get_application(id:number) : Promise<application_model> {
        const res = await this.db<application_model[]>`
            select * from uscope.applications where id=${id}
        `;
        return res[0];
    }

    public async add_application(app:application_model) : Promise<any> {

        // @ts-ignore
        const res: any = await this.db`
            insert into uscope.applications (
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
            )
        `;
    }


    public async update_application_field(id:number, field_name: string, field_value:any) : Promise<object> {

        const res = await this.db`
            update uscope.applications set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        return res[0];
    }


    public async remove_application(id:number) : Promise<object> {
        const res = await this.db`
            delete from uscope.applications where id=${id}
        `;
        return res[0];
    }

}

export default applications_db;