import postgres from "postgres";
import peripheral_model from "../data_model/peripheral_model";


class peripherals_db {
    private db: postgres.Sql;

    constructor(d: postgres.Sql) {
        this.db = d;
    }

    public async get_version(): Promise<string> {
        const res = await this.db`
            select version from uscope.data_versions where "table"='Peripherals'
        `
        return res[0].version;
    }

    public async load_all() : Promise<peripheral_model[]> {
        return this.db<peripheral_model[]>`
            select * from uscope.peripherals
        `;
    }

    public async get_peripheral(id:number) : Promise<peripheral_model> {
        const res = await this.db<peripheral_model[]>`
            select * from uscope.peripherals where id=${id}
        `;
        return res[0];
    }

    public async add_peripheral(app:peripheral_model) : Promise<any> {

        // @ts-ignore
        const res: any = await this.db`
            insert into uscope.peripherals (
                id,
                name,
                image,
                version,
                parametric,
                registers
            ) values (
                ${app.id},
                ${app.name},
                ${app.image},
                ${app.version},
                ${app.parametric},
                ${app.registers}
            )
        `;
    }

    public async update_peripheral_field(id:number, field_name: string, field_value:any) : Promise<object> {

        const res = await this.db`
            update uscope.peripherals set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        return res[0];
    }

    public async remove_peripheral(id:number) : Promise<object> {
        const res = await this.db`
            delete from uscope.peripherals where id=${id}
        `;
        return res[0];
    }


}

export default peripherals_db;