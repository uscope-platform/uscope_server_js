import Koa from "koa";
import bodyParser from "koa-bodyparser";
import jwt from "koa-jwt"
import request from "supertest";
import {expect} from "@jest/globals";
import {settings_router, endpoints_map} from "../../../src/API/frontend";
import {hil_address_map} from "../../../src/data_model";
import {SettingsBackend, authorizer, error_handler} from "../../../src/API/backend";
import hw_interface from "../../../src/hardware_interface/hw_interface";



describe('Settings API tests', () => {

    const app = new Koa();

    app.use(bodyParser());


    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())

    let driver_host = "";
    let driver_port = 0;

    let hw_if = new hw_interface(driver_host, driver_port);
    let rtr = new settings_router(new SettingsBackend(hw_if));
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3009);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('get_debug_level', async () => {

        let router = rtr as any;
        const spy = jest.spyOn(router.backend, 'get_debug_level').mockImplementation(
            () : string => {
                return "minimal"
            });

        return request(app.callback())
            .get(endpoints_map.settings.prefix + endpoints_map.settings.endpoints.debug_level)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toBeCalledTimes(1);
                expect(response.text).toStrictEqual("minimal");
            });

    });


    test('set_debug_level', async () => {

        let router = rtr as any;
        let result = "";
        const spy = jest.spyOn(router.backend, 'set_debug_level').mockImplementation(
            (arg:any)  => {
               result= arg
            });



        return request(app.callback())
            .post(endpoints_map.settings.prefix + endpoints_map.settings.endpoints.debug_level)
            .set('Authorization', `Bearer ${token}`)
            .send({level:"minimal"})
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toBeCalledTimes(1);
                expect(result).toStrictEqual("minimal");
            });

    });

    test('get_address_map', async () => {

        let router = rtr as any;
        let a_map = {'bases': {'controller': 18316591104, 'cores_control': 18316656640, 'cores_inputs': 8192, 'cores_rom': 21474836480, 'hil_control': 18316525568, 'scope_mux': 18316853248}, 'offsets': {'controller': 4096, 'cores_control': 65536, 'cores_inputs': 4096, 'cores_rom': 268435456, 'dma': 4096, 'hil_tb': 0}};

        const spy = jest.spyOn(router.backend, 'get_hil_map').mockImplementation(
            () : hil_address_map => {
                return a_map;
            });

        return request(app.callback())
            .get(endpoints_map.settings.prefix + endpoints_map.settings.endpoints.hil_address_map)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toBeCalledTimes(1);
                expect(response.body).toStrictEqual(a_map);
            });

    });


    test('set_address_map', async () => {

        let router = rtr as any;
        let result = "";
        const spy = jest.spyOn(router.backend, 'set_hil_map').mockImplementation(
            (arg:any)  => {
                result= arg
            });

        let a_map = {'bases': {'controller': 18316591104, 'cores_control': 18316656640, 'cores_inputs': 8192, 'cores_rom': 21474836480, 'hil_control': 18316525568, 'scope_mux': 18316853248}, 'offsets': {'controller': 4096, 'cores_control': 65536, 'cores_inputs': 4096, 'cores_rom': 268435456, 'dma': 4096, 'hil_tb': 0}};

        return request(app.callback())
            .post(endpoints_map.settings.prefix + endpoints_map.settings.endpoints.hil_address_map)
            .set('Authorization', `Bearer ${token}`)
            .send(a_map)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toBeCalledTimes(1);
                expect(result).toStrictEqual(a_map);
            });

    });


    test('get debugger option', async () => {

        let router = rtr as any;
        const spy = jest.spyOn(router.backend, 'get_debugger_option').mockImplementation(
            () : boolean => {
                return true
            });

        let path = endpoints_map.settings.prefix + endpoints_map.settings.endpoints.debugger_option;
        path = path.replace(":name", "test_opt");

        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toBeCalledTimes(1);
                    expect(response.body).toStrictEqual(true);
            });

    });


    test('set debugger option', async () => {

        let router = rtr as any;
        let result = "";
        const spy = jest.spyOn(router.backend, 'set_debugger_option').mockImplementation(
            (arg:any)  => {
                result= arg
            });

        let input = {test_opt:false};

        return request(app.callback())
            .post(endpoints_map.settings.prefix + endpoints_map.settings.endpoints.debugger_option)
            .set('Authorization', `Bearer ${token}`)
            .send(input)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(spy).toBeCalledTimes(1);
                expect(result).toStrictEqual(input);
            });

    });

    afterEach(() => {
        // restore the spy created with spyOn
        jest.clearAllMocks();
    });


    afterAll(() =>{
        server.close()
    } );
});
