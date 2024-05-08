import postgres from "postgres";
import script_model from "../data_model/script_model";
import program_model from "../data_model/program_model";

class programs_db {
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
            select version from ${this.db(this.schema)}.data_versions where "table"='programs'
        `
        return res[0].version;
    }

    public async load_all() : Promise<program_model[]> {
        return this.db<program_model[]>`
            select * from ${this.db(this.schema)}.programs
        `;
    }


    public async get_program(id:number) : Promise<program_model> {
        const res = await this.db<program_model[]>`
            select * from ${this.db(this.schema)}.programs where id=${id}
        `;
        return res[0];
    }

    public async add_program(app:program_model) : Promise<any> {

        // @ts-ignore
        const res: any = await this.db`
            insert into ${this.db(this.schema)}.programs (
                id,
                name,
                content,
                type,
                headers,
                hex,
                cached_bin_version,
                build_settings
            ) values (
                ${app.id},
                ${app.name},
                ${app.content},
                ${app.type},
                ${app.headers},
                ${app.hex},
                ${app.cached_bin_version},
                ${app.build_settings}
            )
        `;
    }


    public async update_program_field(id:number, field_name: string, field_value:any) : Promise<object> {

        const res = await this.db`
            update ${this.db(this.schema)}.programs set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        return res[0];
    }


    public async remove_program(id:number) : Promise<object> {
        const res = await this.db`
            delete from ${this.db(this.schema)}.programs where id=${id}
        `;
        return res[0];
    }


}

export default programs_db;