import postgres from "postgres";
import program_model from "../data_model/program_model";

class programs_db {
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
            select version from ${this.db(this.schema)}.data_versions where "table"='programs'
        `
        return res[0].version;
    }

    public async load_all() : Promise<program_model[]> {
        let res = await this.db`
            select * from ${this.db(this.schema)}.programs
        `;

        return <program_model[]> res.map((prg)=>{
            prg.hex = prg.hex.map((val:string)=>{
                return parseInt(val);
            })
            return prg;
        })
    }


    public async get_program(id:number) : Promise<program_model> {
        const res = await this.db`
            select * from ${this.db(this.schema)}.programs where id=${id}
        `;
        res[0].hex = res[0].hex.map((val:string)=>{
            return parseInt(val);
        })
        return <program_model>res[0];
    }

    public async add_program(prog:program_model) : Promise<any> {

        // @ts-ignore
        await this.db`
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
                ${prog.id},
                ${prog.name},
                ${prog.content},
                ${prog.type},
                ${prog.headers},
                ${prog.hex},
                ${prog.cached_bin_version},
                ${prog.build_settings}
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

    public async program_exists(id:number) : Promise<boolean> {
        let res = await this.db`
            SELECT EXISTS(SELECT 1 FROM ${this.db(this.schema)}.programs WHERE id=${id})
        `
        return res[0].exists;
    }

}

export default programs_db;