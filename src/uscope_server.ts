import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import {} from "./API/backend/middleware";
import jwt from "koa-jwt";
import applications_router from "./API/frontend/applications_api";
import database from "./Database/Database";
import bitstream_router from "./API/frontend/bitstreams_api";
import emulators_router from "./API/frontend/emulators_api";
import filters_router from "./API/frontend/filters_api";
import operations_router from "./API/frontend/operations_api";
import peripherals_router from "./API/frontend/peripherals_api";
import programs_router from "./API/frontend/programs_api";
import scripts_router from "./API/frontend/scripts_api";
import settings_router from "./API/frontend/settings_api";
import {FiltersBackend, OperationsBackend, SettingsBackend, authorizer, error_handler} from "./API/backend";
import hw_interface from "./hardware_interface/hw_interface";
import platform_router from "./API/frontend/platform_api";

import cors from '@koa/cors';

const app = new Koa();


let jwt_secret = "super secret v2"

app.use(cors())

// middleware
app.use(bodyParser({
    jsonLimit:"150mb"
}));

// Error handling middleware
app.use(error_handler);
app.use(jwt({ secret: jwt_secret, passthrough: true }));
app.use(authorizer())

let db : database;

if(process.env.DATABASE_HOST) {
    db = new database(process.env.DATABASE_HOST, "uscope", "test", "uscope")
} else {
    console.log("DATABASE_HOST environment variable doesn't exist");
    process.exit(4);
}

db.init_db().then(r => {
    let hw_if : hw_interface;
    if(process.env.DRIVER_HOST && process.env.DRIVER_PORT) {
        hw_if = new hw_interface(process.env.DRIVER_HOST, parseInt(process.env.DRIVER_PORT));
    } else {

        console.log("DRIVER_HOST or DRIVER_PORT environment variable doesn't exist");
        process.exit(4);
    }

    let flt = new FiltersBackend(db, hw_if);
    let ops = new OperationsBackend(db, hw_if);
    let set = new SettingsBackend(hw_if);

    let app_rtr = new applications_router(db)
    app.use(app_rtr.router.routes())
    app.use(app_rtr.router.allowedMethods());

    let bit_rtr = new bitstream_router(db);
    app.use(bit_rtr.router.routes())
    app.use(bit_rtr.router.allowedMethods());

    let emu_rtr = new emulators_router(db);
    app.use(emu_rtr.router.routes());
    app.use(emu_rtr.router.allowedMethods());

    let flt_rtr = new filters_router(db);
    app.use(flt_rtr.router.routes());
    app.use(flt_rtr.router.allowedMethods());

    let op_rtr = new operations_router(db, ops, flt);
    app.use(op_rtr.router.routes());
    app.use(flt_rtr.router.allowedMethods());

    let per_rtr = new peripherals_router(db);
    app.use(per_rtr.router.routes());
    app.use(per_rtr.router.allowedMethods());

    let prog_rtr = new programs_router(db);
    app.use(prog_rtr.router.routes());
    app.use(prog_rtr.router.allowedMethods());

    let scr_rtr = new scripts_router(db);
    app.use(scr_rtr.router.routes());
    app.use(scr_rtr.router.allowedMethods());

    let set_rtr = new settings_router(set);
    app.use(set_rtr.router.routes());
    app.use(set_rtr.router.allowedMethods());

    let plt_rtr = new platform_router(jwt_secret, db, hw_if);
    app.use(plt_rtr.router.routes());
    app.use(plt_rtr.router.allowedMethods());


    console.log("SERVER READY");
    app.listen(8989);
});
