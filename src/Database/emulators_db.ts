import postgres from "postgres";
import {emulator_model, connection_model, core_model, dma_channel_model} from "../data_model";


export class emulators_db {
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
            select version from ${this.db(this.schema)}.data_versions where "table"='emulators'
        `
        return res[0].version;
    }

    public async load_all() : Promise<emulator_model[]> {
        let emu = await this.db<emulator_model[]>`
            select * from ${this.db(this.schema)}.emulators
        `;
        return <emulator_model[]>emu.map((e)=>{return e;});
    }

    public async get_emulator(id:number) : Promise<emulator_model> {
        const res = await this.db<emulator_model[]>`
            select * from ${this.db(this.schema)}.emulators where id=${id}
        `;
        return res[0];
    }

    public async add_emulator(emu:emulator_model) : Promise<any> {

        // @ts-ignore
        await this.db`
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

    public async add_core(id:number, core:core_model){
        let emu = await this.get_emulator(id);
        let new_cores = emu.cores;
        new_cores[core.id.toString(10)] = core;
        return await this.update_emulator_field(id, "cores", new_cores);
    }

    public async update_core(id:number, core:core_model) {
        let emu = await this.get_emulator(id);
        emu.cores[core.id.toString(10)] = core;
        return await this.update_emulator_field(id, "cores", emu.cores);
    }

    public async remove_core(id:number, core_id:number) {
        let emu = await this.get_emulator(id);
        delete emu.cores[core_id.toString(10)];
        return await this.update_emulator_field(id, "cores", emu.cores);
    }

    public async add_connection(id:number, connection:connection_model){
        let emu = await this.get_emulator(id);
        let new_conn = emu.connections;
        new_conn.push(connection);
        return await this.update_emulator_field(id, "connections", new_conn);
    }


    public async add_dma_channel(id:number, src:string, dst:string, channel:dma_channel_model){
        let emu = await this.get_emulator(id);
        let conn = emu.connections.filter((e:connection_model)=>{
            return e.source == src && e.destination == dst;
        });
        if(conn.length == 0){
            throw "Connection not found";
        }
        conn[0].channels.push(channel);
        return await this.update_emulator_field(id, "connections", emu.connections);
    }

    public async edit_dma_channel(id:number, src:string, dst:string, channel_name:string, channel:dma_channel_model) {
        let emu = await this.get_emulator(id);
        let conn = emu.connections.filter((e:connection_model)=>{
            return e.source == src && e.destination == dst;
        });
        if(conn.length == 0){
            throw "Connection not found";
        }
        conn[0].channels = conn[0].channels.map((e:dma_channel_model)=>{
            if( e.name === channel_name)
                return channel;
            else
                return e;
        });
        return await this.update_emulator_field(id, "connections", emu.connections);
    }


    public async remove_dma_channel(emu_id:number, src:string, dst:string, ch_name: string) {
        let emu = await this.get_emulator(emu_id);
        let conn = emu.connections.filter((e:connection_model)=>{
            return e.source == src && e.destination == dst;
        });
        if(conn.length == 0){
            throw "Connection not found";
        }
        conn[0].channels = conn[0].channels.filter((e:dma_channel_model)=>{
            return e.name !== ch_name;
        });
        return await this.update_emulator_field(emu_id, "connections", emu.connections);
    }

    public async remove_connection(id:number, src:string, dst:string) {
        let emu = await this.get_emulator(id);
        emu.connections = emu.connections.filter((e:connection_model)=>{
            return e.source !== src || e.destination !== dst;
        });
        return await this.update_emulator_field(id, "connections",  emu.connections);
    }

    public async edit_atomic_field(id:number, field_name: string, field_value:any): Promise<object>{
        const res = await this.db`
            update ${this.db(this.schema)}.emulators set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        return res[0];
    }


    private async update_emulator_field(id:number, field_name: string, field_value:any) : Promise<object> {

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
