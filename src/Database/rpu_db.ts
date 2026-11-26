import postgres from "postgres";
import {rpu_model} from "#models";
import {createHash} from "node:crypto";

export class rpu_db {
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
            select version from ${this.db(this.schema)}.data_versions where "table"='rpu_programs'
        `
        return res[0].version;
    }

    public async load_all() : Promise<rpu_model[]> {
        let rpu = await this.db<rpu_model[]>`
            select * from ${this.db(this.schema)}.rpu_programs
        `;
        return <rpu_model[]>rpu.map((r)=>{return r;});
    }

    public async get_rpu_program(id:number) : Promise<rpu_model> {
        const res = await this.db<rpu_model[]>`
            select * from ${this.db(this.schema)}.rpu_programs where id=${id}
        `;
        return res[0];
    }
    public async get_by_name(name:string) : Promise<rpu_model> {
        const res = await this.db<rpu_model[]>`
            select * from ${this.db(this.schema)}.rpu_programs where name=${name}
        `;
        return res[0];
    }


    public async add_rpu_program(rpu_prog:rpu_model) : Promise<any> {

        let file_hash = createHash('sha256').update(rpu_prog.data).digest('hex');

        // @ts-ignore
        return this.db`
            insert into ${this.db(this.schema)}.rpu_programs (
                id,
                name,
                core,
                data,
                hash
            ) values (
                ${rpu_prog.id},
                ${rpu_prog.name},
                ${rpu_prog.core},
                ${rpu_prog.data}, 
                ${file_hash}
            )
        `;
    }


    public async update_rpu_program_field(id:number, field_name: string, field_value:any) : Promise<object> {


        let res = await this.db`
            update ${this.db(this.schema)}.rpu_programs set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        if(field_name === "data"){
            let file_hash = createHash('sha256').update(field_value).digest('hex');

            res = await this.db`
            update ${this.db(this.schema)}.rpu_programs set hash=${file_hash} where id=${id}
            `;
        }
        return res[0];
    }


    public async remove_rpu_program(id:number) : Promise<object> {
        const res = await this.db`
            delete from ${this.db(this.schema)}.rpu_programs where id=${id}
        `;
        return res[0];
    }

    public async rpu_program_exists(id:number) : Promise<boolean> {
        let res = await this.db`
            SELECT EXISTS(SELECT 1 FROM ${this.db(this.schema)}.rpu_programs WHERE id=${id})
        `
        return res[0].exists;
    }

}
