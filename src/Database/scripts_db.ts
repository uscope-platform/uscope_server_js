import postgres from "postgres";
import script_model from "../data_model/script_model";
import {application_model} from "../data_model/application_model";

class scripts_db {
    private db: postgres.Sql;

    constructor(d: postgres.Sql) {
        this.db = d;
    }

    public async get_version(): Promise<string> {
        const res = await this.db`
            select version from uscope.data_versions where "table"='scripts'
        `
        return res[0].version;
    }

    public async load_all() : Promise<script_model[]> {
        return this.db<script_model[]>`
            select * from uscope.scripts
        `;
    }


    public async get_script(id:number) : Promise<script_model> {
        const res = await this.db<script_model[]>`
            select * from uscope.scripts where id=${id}
        `;
        return res[0];
    }

    public async add_script(app:script_model) : Promise<any> {

        // @ts-ignore
        const res: any = await this.db`
            insert into uscope.scripts (
                id,
                name,
                path,
                content,
                triggers
            ) values (
                ${app.id},
                ${app.name},
                ${app.path},
                ${app.script_content},
                ${app.triggers}
            )
        `;
    }


    public async update_script_field(id:number, field_name: string, field_value:any) : Promise<object> {

        const res = await this.db`
            update uscope.scripts set ${this.db(field_name)}=${field_value} where id=${id}
        `;
        return res[0];
    }


    public async remove_script(id:number) : Promise<object> {
        const res = await this.db`
            delete from uscope.scripts where id=${id}
        `;
        return res[0];
    }


}

export default scripts_db;