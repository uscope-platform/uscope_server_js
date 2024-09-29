import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import {authorizer, error_handler} from "./API/backend/middleware";
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
import FiltersBackend from "./API/backend/filters";
import OperationsBackend from "./API/backend/operations";
import SettingsBackend from "./API/backend/settings";
import hw_interface from "./hardware_interface/hw_interface";
import platform_router from "./API/frontend/platform_api";

import cors from '@koa/cors';

const app = new Koa();


let jwt_secret = "super secret v2"

// middleware
app.use(bodyParser());

// Error handling middleware
app.use(error_handler);
app.use(jwt({ secret: jwt_secret, passthrough: true }));
app.use(authorizer())

let db = new database("localhost", "uscope", "test", "uscope")

let driver_host = "localhost";
let driver_port = 6666;

let hw_if = new hw_interface(driver_host, driver_port);

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


app.use(cors())
console.log("SERVER READY");
let server = app.listen(6969);
