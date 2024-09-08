import postgres from "postgres";
import peripheral_model from "../data_model/peripheral_model";
import emulator_model from "../data_model/emulator_model";


class emulators_db {
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
            select version from ${this.db(this.schema)}.data_versions where "table"='emulators'
        `
        return res[0].version;
    }

    public async load_all() : Promise<emulator_model[]> {
        return this.db<emulator_model[]>`
            select * from ${this.db(this.schema)}.emulators
        `;
    }

    public async get_emulator(id:number) : Promise<emulator_model> {
        const res = await this.db<emulator_model[]>`
            select * from ${this.db(this.schema)}.emulators where id=${id}
        `;
        return res[0];
    }

    public async add_emulator(emu:emulator_model) : Promise<any> {

        // @ts-ignore
        const res: any = await this.db`
            insert into ${this.db(this.schema)}.emulators (
                id,
                name,
                cores,
                connections,
                emulation_time,
                deployment_mode
            ) values (
                ${emu.id},
                ${emu.name},
                ${emu.cores},
                ${emu.connections},
                ${emu.emulation_time},
                ${emu.deployment_mode}
            )
        `;
    }


    public async update_emulator_field(id:number, field_name: string, field_value:any) : Promise<object> {

        const res = await this.db`
            update ${this.db(this.schema)}.emulators set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        return res[0];
    }


    public async remove_emulator(id:number) : Promise<object> {
        const res = await this.db`
            delete from ${this.db(this.schema)}.emulators where id=${id}
        `;
        return res[0];
    }

    public async emulator_exists(id:number) : Promise<boolean> {
        let res = await this.db`
            SELECT EXISTS(SELECT 1 FROM ${this.db(this.schema)}.emulators WHERE id=${id})
        `
        return res[0].exists;
    }


}

export default emulators_db;