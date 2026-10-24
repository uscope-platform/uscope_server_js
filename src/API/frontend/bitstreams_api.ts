import Router from "koa-router";
import {database} from "#database";
import * as Koa from "koa";
import {endpoints_map} from ".";
import {bitstream_edit_model, bitstream_model} from "#models";

export class bitstream_router {
    public router: Router;
    public db: database;
    constructor(db: database) {
        this.db = db

        this.router = new Router({
            prefix: endpoints_map.bitstream.prefix
        });

        this.router.get(endpoints_map.bitstream.endpoints.hash, async (ctx:Koa.Context) => {
            ctx.response.status = 200;
            ctx.response.body = await this.db.bitstreams.get_version();
        });


        this.router.get(endpoints_map.bitstream.endpoints.load_all, async (ctx:Koa.Context) => {
            let raw_res =  await this.db.bitstreams.load_all();
            ctx.body = raw_res.map((bit: bitstream_model)=>{
                // the hash is the SHA-256 of the file: it tells which version of the bitstream it is
                return {id:bit.id, name:bit.name, hash:bit.hash};
            })
            ctx.status = 200
        });



        this.router.get(endpoints_map.bitstream.endpoints.get, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            let bit = await this.db.bitstreams.get_bitstream(id) as any;
            if(ctx.query["export-bitfile"] !== "true") {
                delete bit.data;
            } else {
                bit.data = Buffer.from(bit.data).toString('base64');
            }
            ctx.body = bit;
            ctx.status = 200
        });


        this.router.post(endpoints_map.bitstream.endpoints.add, async (ctx:Koa.Context) => {
            let  bit = ctx.request.body as any;
            bit.data = get_decoded_file(bit.data);
            await this.db.bitstreams.add_bitstream(<bitstream_model>bit);
            ctx.status = 200
        });

        this.router.patch(endpoints_map.bitstream.endpoints.edit, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            let e = <bitstream_edit_model>ctx.request.body;

            if(e.field.name === "data"){
                e.field.value= get_decoded_file(e.field.value);
            }

            ctx.body = await this.db.bitstreams.update_bitstream_field(id, e.field.name, e.field.value);
            ctx.status = 200
        });

        this.router.delete(endpoints_map.bitstream.endpoints.delete, async (ctx:Koa.Context) => {
            let id = parseInt(ctx.params.id);
            await this.db.bitstreams.remove_bitstream(id)
            ctx.status = 200
        });

        let get_decoded_file = (file_content:string) : Buffer =>{

            const base64Data = file_content.replace(/^data:.*;base64,/, '');
            return Buffer.from(base64Data, 'base64');

        }
    }
}
