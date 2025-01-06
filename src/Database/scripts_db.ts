import postgres from "postgres";
import {script_model} from "#models";

export class scripts_db {
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
            select version from ${this.db(this.schema)}.data_versions where "table"='scripts'
        `
        return res[0].version;
    }

    public async load_all() : Promise<script_model[]> {
        let raw_res = await this.db`
            select * from ${this.db(this.schema)}.scripts
        `;
        return <script_model[]> raw_res.map((scr)=>{
            return scr;
        })
    }


    public async get_script(id:number) : Promise<script_model> {
        const raw_res = await this.db`
            select * from ${this.db(this.schema)}.scripts where id=${id}
        `;
        return <script_model> raw_res[0];
    }

    public async add_script(app:script_model) : Promise<any> {

        // @ts-ignore
        await this.db`
            insert into ${this.db(this.schema)}.scripts (
                id,
                name,
                path,
                content,
                triggers
            ) values (
                ${app.id},
                ${app.name},
                ${app.path},
                ${app.content},
                ${app.triggers}
            )
        `;
    }


    public async update_script_field(id:number, field_name: string, field_value:any) : Promise<object> {

        const res = await this.db`
            update ${this.db(this.schema)}.scripts set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        return res[0];
    }


    public async remove_script(id:number) : Promise<object> {
        const res = await this.db`
            delete from ${this.db(this.schema)}.scripts where id=${id}
        `;
        return res[0];
    }

    public async script_exists(id:number) : Promise<boolean> {
        let res = await this.db`
            SELECT EXISTS(SELECT 1 FROM ${this.db(this.schema)}.scripts WHERE id=${id})
        `
        return res[0].exists;
    }


}
