import postgres from "postgres";
import peripheral_model from "../data_model/peripheral_model";
import emulator_model from "../data_model/emulator_model";


class emulators_db {
    private db: postgres.Sql;

    constructor(d: postgres.Sql) {
        this.db = d;
    }

    public async get_version(): Promise<string> {
        const res = await this.db`
            select version from uscope.data_versions where "table"='emulators'
        `
        return res[0].version;
    }

    public async load_all() : Promise<emulator_model[]> {
        return this.db<emulator_model[]>`
            select * from uscope.emulators
        `;
    }

    public async get_emulator(id:number) : Promise<emulator_model> {
        const res = await this.db<emulator_model[]>`
            select * from uscope.emulators where id=${id}
        `;
        return res[0];
    }

    public async add_emulator(app:emulator_model) : Promise<any> {

        // @ts-ignore
        const res: any = await this.db`
            insert into uscope.emulators (
                id,
                name,
                cores,
                connections,
                n_cycles,
                async_multirate
            ) values (
                ${app.id},
                ${app.name},
                ${app.cores},
                ${app.connections},
                ${app.n_cycles},
                ${app.async_multirate}
            )
        `;
    }


    public async update_emulator_field(id:number, field_name: string, field_value:any) : Promise<object> {

        const res = await this.db`
            update uscope.emulators set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        return res[0];
    }


    public async remove_emulator(id:number) : Promise<object> {
        const res = await this.db`
            delete from uscope.emulators where id=${id}
        `;
        return res[0];
    }


}

export default emulators_db;