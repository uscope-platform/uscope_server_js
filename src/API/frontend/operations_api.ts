import Router from "koa-router";
import database from "../../Database/Database";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";
import OperationsBackend from "../backend/operations";
import register_write_model from "../../data_model/operations_model";

class operations_router {
    public router: Router;
    public db: database;
    private ops_backend: OperationsBackend;

    constructor(db: database, driver_host:string, driver_port:number) {
        this.db = db
        this.ops_backend = new OperationsBackend(driver_host, driver_port);

        this.router = new Router({
            prefix: endpoints_map.operations.prefix
        });


        this.router.get(endpoints_map.operations.endpoints.load_application, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let id = parseInt(ctx.params.id);
                let app =await this.db.applications.get_application(id);
                let bitstream = await this.db.bitstreams.get_by_path(app.bitstream)
                await this.ops_backend.load_application(app, bitstream);
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next()
            }
        });


        this.router.post(endpoints_map.operations.endpoints.write_registers, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let data = <register_write_model[]>ctx.request.body;
                for(let item of data){
                    if(item.type === "proxied"){
                        await this.ops_backend.write_register_proxied(item.proxy_address, item.address, item.value);
                    } else{
                        await this.ops_backend.write_register_direct(item.address, item.value);
                    }
                }
                ctx.status = 200;
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next();
            }
        });


        this.router.get(endpoints_map.operations.endpoints.read_register, async (ctx:Koa.Context, next:Koa.Next) => {
            try{
                let address = parseInt(ctx.params.address);
                ctx.response.status = 200;
                ctx.response.body = await this.ops_backend.read_register(address);
                ctx.status = 200
            } catch(error:any){
                ctx.message = error
                ctx.status = 501
                next()
            }
        });
    }
}

export default operations_router;

