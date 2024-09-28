import postgres from "postgres";
import bitstream_model from "../data_model/bitstreams_model";
import {createHash} from "node:crypto";
import peripheral_model from "../data_model/peripheral_model";

class bitstreams_db {
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
            select version from ${this.db(this.schema)}.data_versions where "table"='Applications'
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
    public async get_by_path(path:string) : Promise<bitstream_model> {
        const res = await this.db<bitstream_model[]>`
            select * from ${this.db(this.schema)}.bitstreams where path=${path}
        `;
        return res[0];
    }


    public async add_bitstream(bit:bitstream_model) : Promise<any> {

        let file_hash = createHash('sha256').update(bit.data).digest('hex');

        // @ts-ignore
        const res: any = await this.db`
            insert into ${this.db(this.schema)}.bitstreams (
                id,
                path,
                data,
                hash
            ) values (
                ${bit.id},
                ${bit.path},
                ${bit.data}, 
                ${file_hash}
            )
        `;
    }


    public async update_bitstream_field(id:number, field_name: string, field_value:any) : Promise<object> {

        const res = await this.db`
            update ${this.db(this.schema)}.bitstreams set ${this.db(field_name)}=${field_value} where id=${id}
        `;
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

export default bitstreams_db;