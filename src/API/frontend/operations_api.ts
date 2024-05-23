import Router from "koa-router";
import database from "../../Database/Database";
import * as Koa from "koa";
import endpoints_map from "./endpoints_map";
import OperationsBackend from "../backend/operations";

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

        });

        this.router.post(endpoints_map.operations.endpoints.read_registers, async (ctx:Koa.Context, next:Koa.Next) => {

        });
    }
}

export default operations_router;

