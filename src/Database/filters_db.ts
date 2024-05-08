import postgres from "postgres";
import filter_model from "../data_model/filters_model";


class filters_db {
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
            select version from ${this.db(this.schema)}.data_versions where "table"='filters'
        `
        return res[0].version;
    }

    public async load_all() : Promise<filter_model[]> {
        return this.db<filter_model[]>`
            select * from ${this.db(this.schema)}.filters
        `;
    }

    public async get_filter(id:number) : Promise<filter_model> {
        const res = await this.db<filter_model[]>`
            select * from ${this.db(this.schema)}.filters where id=${id}
        `;
        return res[0];
    }

    public async add_filter(app:filter_model) : Promise<any> {

        // @ts-ignore
        const res: any = await this.db`
            insert into ${this.db(this.schema)}.filters (
                id,
                name,
                parameters,
                ideal_taps,
                quantized_taps
            ) values (
                ${app.id},
                ${app.name},
                ${app.parameters},
                ${app.ideal_taps},
                ${app.quantized_taps}
            )
        `;
    }


    public async update_filter_field(id:number, field_name: string, field_value:any) : Promise<object> {

        const res = await this.db`
            update ${this.db(this.schema)}.filters set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        return res[0];
    }


    public async remove_filter(id:number) : Promise<object> {
        const res = await this.db`
            delete from ${this.db(this.schema)}.filters where id=${id}
        `;
        return res[0];
    }



}

export default filters_db;