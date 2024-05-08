import postgres from "postgres";
import bitstream_model from "../data_model/bitstreams_model";

class bitstreams_db {
    private db: postgres.Sql;

    constructor(d: postgres.Sql) {
        this.db = d;
    }

    public async close(): Promise<void>{
        this.db.end();
    }

    public async get_version(): Promise<string> {
        const res = await this.db`
            select version from uscope.data_versions where "table"='Applications'
        `
        return res[0].version;
    }

    public async load_all() : Promise<bitstream_model[]> {
        return this.db<bitstream_model[]>`
            select * from uscope.bitstreams
        `;
    }

    public async get_bitstream(id:number) : Promise<bitstream_model> {
        const res = await this.db<bitstream_model[]>`
            select * from uscope.bitstreams where id=${id}
        `;
        return res[0];
    }

    public async add_bitstream(bit:bitstream_model) : Promise<any> {

        // @ts-ignore
        const res: any = await this.db`
            insert into uscope.bitstreams (
                id,
                path
            ) values (
                ${bit.id},
                ${bit.path}
            )
        `;
    }


    public async update_bitstream_field(id:number, field_name: string, field_value:any) : Promise<object> {

        const res = await this.db`
            update uscope.bitstreams set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        return res[0];
    }


    public async remove_bitstream(id:number) : Promise<object> {
        const res = await this.db`
            delete from uscope.bitstreams where id=${id}
        `;
        return res[0];
    }

}

export default bitstreams_db;