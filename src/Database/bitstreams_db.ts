import postgres from "postgres";
import {bitstream_model} from "../data_model";
import {createHash} from "node:crypto";

export class bitstreams_db {
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
            select version from ${this.db(this.schema)}.data_versions where "table"='bitstreams'
        `
        return res[0].version;
    }

    public async load_all() : Promise<bitstream_model[]> {
        let bit = await this.db<bitstream_model[]>`
            select * from ${this.db(this.schema)}.bitstreams
        `;
        return <bitstream_model[]>bit.map((b)=>{return b;});
    }

    public async get_bitstream(id:number) : Promise<bitstream_model> {
        const res = await this.db<bitstream_model[]>`
            select * from ${this.db(this.schema)}.bitstreams where id=${id}
        `;
        return res[0];
    }
    public async get_by_name(name:string) : Promise<bitstream_model> {
        const res = await this.db<bitstream_model[]>`
            select * from ${this.db(this.schema)}.bitstreams where name=${name}
        `;
        return res[0];
    }


    public async add_bitstream(bit:bitstream_model) : Promise<any> {

        let file_hash = createHash('sha256').update(bit.data).digest('hex');

        // @ts-ignore
        return this.db`
            insert into ${this.db(this.schema)}.bitstreams (
                id,
                name,
                data,
                hash
            ) values (
                ${bit.id},
                ${bit.name},
                ${bit.data}, 
                ${file_hash}
            )
        `;
    }


    public async update_bitstream_field(id:number, field_name: string, field_value:any) : Promise<object> {


        let res = await this.db`
            update ${this.db(this.schema)}.bitstreams set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        if(field_name === "data"){
            let file_hash = createHash('sha256').update(field_value).digest('hex');

            res = await this.db`
            update ${this.db(this.schema)}.bitstreams set hash=${file_hash} where id=${id}
            `;
        }
        return res[0];
    }


    public async remove_bitstream(id:number) : Promise<object> {
        const res = await this.db`
            delete from ${this.db(this.schema)}.bitstreams where id=${id}
        `;
        return res[0];
    }

    public async bitstream_exists(id:number) : Promise<boolean> {
        let res = await this.db`
            SELECT EXISTS(SELECT 1 FROM ${this.db(this.schema)}.bitstreams WHERE id=${id})
        `
        return res[0].exists;
    }

}
