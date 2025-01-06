import postgres from "postgres";
import {peripheral_model, field_model, register_model} from "#models";


export class peripherals_db {
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
            select version from ${this.db(this.schema)}.data_versions where "table"='Peripherals'
        `
        return res[0].version;
    }

    public async load_all() : Promise<peripheral_model[]> {
        let per = await this.db<peripheral_model[]>`
            select * from ${this.db(this.schema)}.peripherals
        `;
        return <peripheral_model[]>per.map((p)=>{return p;});
    }

    public async get_peripheral(id:number) : Promise<peripheral_model> {
        const res = await this.db<peripheral_model[]>`
            select * from ${this.db(this.schema)}.peripherals where id=${id}
        `;
        return res[0];
    }

    public async add_peripheral(app:peripheral_model) : Promise<any> {

        // @ts-ignore
        await this.db`
            insert into ${this.db(this.schema)}.peripherals (
                id,
                name,
                image,
                version,
                parametric,
                registers
            ) values (
                ${app.id},
                ${app.name},
                ${""},
                ${app.version},
                ${app.parametric},
                ${app.registers}
            )
        `;
    }

    public async add_register(peripheral_id:number, reg:register_model) : Promise<any> {
        let p = await this.get_peripheral(peripheral_id);
        p.registers.push(reg);
        return await this.update_peripheral_field(peripheral_id, "registers", p.registers);
    }

    public async edit_register(peripheral_id:number, reg:register_model) : Promise<any> {
        let p = await this.get_peripheral(peripheral_id);
        p.registers = p.registers.map((entry)=>{
            if(entry.ID === reg.ID) return reg;
            else return entry;
        })
        return await this.update_peripheral_field(peripheral_id, "registers", p.registers);
    }

    public async remove_register(peripheral_id:number, register_id:string) : Promise<any> {
        let p = await this.get_peripheral(peripheral_id);
        p.registers = p.registers.filter((entry)=>{
            return entry.ID !== register_id;
        });
        return await this.update_peripheral_field(peripheral_id, "registers", p.registers);
    }

    public async add_field(peripheral_id:number, register_id: string, field:field_model) {
        let p = await this.get_peripheral(peripheral_id);
        let reg = p.registers.filter((entry)=>{
            return entry.ID === register_id;
        });
        if(reg.length == 0) {
            throw "Register not found";
        }
        reg[0].fields.push(field);
        return await this.update_peripheral_field(peripheral_id, "registers", p.registers);
    }

    public async edit_field(peripheral_id:number, register_id: string, field:field_model): Promise<any>{
        let p = await this.get_peripheral(peripheral_id);
        let reg = p.registers.filter((entry)=>{
            return entry.ID === register_id;
        });
        if(reg.length == 0) {
            throw "Register not found";
        }
        reg[0].fields = reg[0].fields.map((entry)=>{
            if(entry.name === field.name) return field;
            else return entry;
        })
        return await this.update_peripheral_field(peripheral_id, "registers", p.registers);
    }

    public async remove_field(peripheral_id:number, register_id: string, field_name:string) : Promise<any> {
        let p = await this.get_peripheral(peripheral_id);
        let reg = p.registers.filter((entry)=>{
            return entry.ID === register_id;
        });
        if(reg.length == 0) {
            throw "Register not found";
        }
        reg[0].fields = reg[0].fields.filter((entry)=>{
            return entry.name !== field_name
        })
        return await this.update_peripheral_field(peripheral_id, "registers", p.registers);
    }

    public async update_peripheral_field(id:number, field_name: string, field_value:any) : Promise<object> {

        const res = await this.db`
            update ${this.db(this.schema)}.peripherals set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        return res[0];
    }

    public async remove_peripheral(id:number) : Promise<object> {
        const res = await this.db`
            delete from ${this.db(this.schema)}.peripherals where id=${id}
        `;
        return res[0];
    }

    public async peripheral_exists(id:number) : Promise<boolean> {
        let res = await this.db`
            SELECT EXISTS(SELECT 1 FROM ${this.db(this.schema)}.peripherals WHERE id=${id})
        `
        return res[0].exists;
    }
}
