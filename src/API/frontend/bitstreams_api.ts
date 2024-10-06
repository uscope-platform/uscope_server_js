import Router from "koa-router";
import database from "../../Database/Database";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";
import bitstream_model, {bitstream_edit_model} from "../../data_model/bitstreams_model";

class bitstream_router {
    public router: Router;
    public db: database;
    constructor(db: database) {
        this.db = db

        this.router = new Router({
            prefix: endpoints_map.bitstream.prefix
        });

        this.router.get(endpoints_map.bitstream.endpoints.hash, async (ctx:Koa.Context) => {
            try{
                ctx.response.status = 200;
                ctx.response.body = await this.db.bitstreams.get_version();
            } catch(error:any){
                ctx.response.body = error
                ctx.response.status = 501

            }
        });


        this.router.get(endpoints_map.bitstream.endpoints.load_all, async (ctx:Koa.Context) => {
            try{
                let raw_res =  await this.db.bitstreams.load_all();
                ctx.body = raw_res.map((bit: bitstream_model)=>{
                    return {id:bit.id, path:bit.path};
                })
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });



        this.router.get(endpoints_map.bitstream.endpoints.get, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                ctx.body =  <bitstream_model>await this.db.bitstreams.get_bitstream(id);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


        this.router.post(endpoints_map.bitstream.endpoints.add, async (ctx:Koa.Context) => {
            try{
                let  bit = <bitstream_model>ctx.request.body;
                await this.db.bitstreams.add_bitstream(bit)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.patch(endpoints_map.bitstream.endpoints.edit, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                let e = <bitstream_edit_model>ctx.request.body;
                ctx.body = await this.db.bitstreams.update_bitstream_field(id, e.field, e.value);
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });

        this.router.delete(endpoints_map.bitstream.endpoints.delete, async (ctx:Koa.Context) => {
            try{
                let id = parseInt(ctx.params.id);
                await this.db.bitstreams.remove_bitstream(id)
                ctx.status = 200
            } catch(error:any){
                ctx.body = error
                ctx.status = 501
            }
        });


    }
}

export default bitstream_router;

