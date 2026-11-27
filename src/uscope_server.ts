import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import jwt from "koa-jwt";
import {
    applications_router, bitstream_router, emulators_router, filters_router,
    peripherals_router, operations_router, programs_router, scripts_router,
    settings_router, platform_router, rpu_router
} from "#api_frontend/index.ts";
import {database} from "#database/index.ts";
import {FiltersBackend, OperationsBackend, SettingsBackend, authorizer, error_handler} from "#api_backend/index.ts";
import {hw_interface} from "#hw/index.ts";

import cors from '@koa/cors';
import {randomBytes} from "node:crypto";

const app = new Koa();


// JWT signing secret:
//  - JWT_SECRET, when set, is used as is.
//  - In a deployment (docker) a random secret is generated at every start, so no secret ever
//    lives in the repository. Access tokens become invalid on restart; clients that chose
//    "remember me" get a new one through their auto-login token on the next page load.
//  - In development a fixed secret is kept, so nodemon reloads do not invalidate tokens.
let jwt_secret: string;
if(process.env.JWT_SECRET) {
    jwt_secret = process.env.JWT_SECRET;
} else if(process.env.USCOPE_DEPLOYMENT_OPTION === "DOCKER") {
    jwt_secret = randomBytes(64).toString("hex");
    console.log("JWT_SECRET not set: using a random signing secret for this run");
} else {
    jwt_secret = "uscope development secret";
}

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

    let rpu_rtr = new rpu_router(db);
    app.use(rpu_rtr.router.routes());
    app.use(rpu_rtr.router.allowedMethods());



    console.log("SERVER READY");
    app.listen(8989);
});
