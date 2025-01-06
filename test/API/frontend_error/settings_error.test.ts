import Koa from "koa";
import bodyParser from "koa-bodyparser";
import jwt from "koa-jwt"
import request from "supertest";
import {expect} from "@jest/globals";
import settings_router from "../../../src/API/frontend/settings_api";
import {SettingsBackend, authorizer, error_handler} from "../../../src/API/backend";
import endpoints_map from "../../../src/API/frontend/endpoints_map";



describe('Settings API error handling tests', () => {

    const app = new Koa();

    app.use(bodyParser());

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())


    let backend ={
        get_debug_level: ():string =>{
            throw "generic db error 70";
        },
        set_debug_level: ():string =>{
            throw "generic db error 71";
        },
        get_hil_map: ():string =>{
            throw "generic db error 72";
        },
        set_hil_map: ():string =>{
            throw "generic db error 73";
        },
        get_debugger_option: ():string =>{
            throw "generic db error 74";
        },
        set_debugger_option: ():string =>{
            throw "generic db error 75";
        },
    } as any as SettingsBackend;

    let rtr = new settings_router(backend);
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3009);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('get_debug_level', async () => {

        return request(app.callback())
            .get(endpoints_map.settings.prefix + endpoints_map.settings.endpoints.debug_level)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 70");
            });

    });


    test('set_debug_level', async () => {

        return request(app.callback())
            .post(endpoints_map.settings.prefix + endpoints_map.settings.endpoints.debug_level)
            .set('Authorization', `Bearer ${token}`)
            .send("minimal")
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 71");
            });

    });

    test('get_address_map', async () => {

        return request(app.callback())
            .get(endpoints_map.settings.prefix + endpoints_map.settings.endpoints.hil_address_map)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 72");
            });

    });


    test('set_address_map', async () => {


        let a_map = {'bases': {'controller': 18316591104, 'cores_control': 18316656640, 'cores_inputs': 8192, 'cores_rom': 21474836480, 'hil_control': 18316525568, 'scope_mux': 18316853248}, 'offsets': {'controller': 4096, 'cores_control': 65536, 'cores_inputs': 4096, 'cores_rom': 268435456, 'dma': 4096, 'hil_tb': 0}};

        return request(app.callback())
            .post(endpoints_map.settings.prefix + endpoints_map.settings.endpoints.hil_address_map)
            .set('Authorization', `Bearer ${token}`)
            .send(a_map)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 73");
            });

    });

    test('get debugger option', async () => {

        let path = endpoints_map.settings.prefix + endpoints_map.settings.endpoints.debugger_option;
        path = path.replace(":name", "test_opt");

        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 74");
            });

    });


    test('set debugger option', async () => {

        let a_map = {"test_opt":true};

        return request(app.callback())
            .post(endpoints_map.settings.prefix + endpoints_map.settings.endpoints.debugger_option)
            .set('Authorization', `Bearer ${token}`)
            .send(a_map)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 75");
            });


    });



    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });


    afterAll(() => server.close());
});
