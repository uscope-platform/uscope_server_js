import Router from "koa-router";
import {database} from "#database";
import * as Koa from "koa";
import {endpoints_map} from ".";
import {rpu_edit_model, rpu_model} from "#models";
import {http_error} from "#api_backend";

// id is the key and hash is derived from data: neither can be set directly
const EDITABLE_FIELDS = ["name", "core", "data"];

export class rpu_router {
    public router: Router;
    public db: database;
    constructor(db: database) {
        this.db = db

        this.router = new Router({
            prefix: endpoints_map.rpu.prefix
        });

        this.router.get(endpoints_map.rpu.endpoints.hash, async (ctx:Koa.Context) => {
            ctx.response.status = 200;
            ctx.response.body = await this.db.rpu_programs.get_version();
        });


        this.router.get(endpoints_map.rpu.endpoints.load_all, async (ctx:Koa.Context) => {
            let raw_res =  await this.db.rpu_programs.load_all();
            ctx.body = raw_res.map((rpu: rpu_model)=>{
                // the hash is the SHA-256 of the file: it tells which version of the program it is
                return {id:rpu.id, name:rpu.name, hash:rpu.hash, core:rpu.core};
            })
            ctx.status = 200
        });

        this.router.get(endpoints_map.rpu.endpoints.get, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            let prog = await this.db.rpu_programs.get_rpu_program(id) as any;
            if(ctx.query["export-program"] !== "true") {
                delete prog.data;
            } else {
                prog.data = Buffer.from(prog.data).toString('base64');
            }
            ctx.body = prog;
            ctx.status = 200
        });


        this.router.post(endpoints_map.rpu.endpoints.add, async (ctx:Koa.Context) => {
            let  rpu = ctx.request.body as any;
            rpu.data = get_decoded_file(rpu.data);
            await this.db.rpu_programs.add_rpu_program(<rpu_model>rpu);
            ctx.status = 200
        });

        this.router.patch(endpoints_map.rpu.endpoints.edit, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            let e = <rpu_edit_model>ctx.request.body;

            if(!EDITABLE_FIELDS.includes(e?.field?.name)){
                throw new http_error(400, "The editable fields are " + EDITABLE_FIELDS.join(", "));
            }

            if(e.field.name === "data"){
                e.field.value= get_decoded_file(e.field.value);
            }

            ctx.body = await this.db.rpu_programs.update_rpu_program_field(id, e.field.name, e.field.value);
            ctx.status = 200
        });

        this.router.delete(endpoints_map.rpu.endpoints.delete, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            await this.db.rpu_programs.remove_rpu_program(id)
            ctx.status = 200
        });

        let get_decoded_file = (file_content:string) : Buffer =>{

            const base64Data = file_content.replace(/^data:.*;base64,/, '');
            return Buffer.from(base64Data, 'base64');

        }
    }
}
