import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../../src/Database/Database";
import {authorizer, error_handler} from "../../../src/API/backend/middleware";
import request from "supertest";
import { expect} from "@jest/globals";
import jwt from "koa-jwt"
import applications_router from "../../../src/API/frontend/applications_api";
import endpoints_map from "../../../src/API/frontend/endpoints_map";


describe('applications API error handling tests', () => {


    const app = new Koa();

    app.use(bodyParser());

    let db = {
        applications:{
            get_version: ():string =>{
                throw "generic db error 0";
            },
            load_all:() =>{
                throw "generic db error 1";
            },
            get_application:() =>{
                throw "generic db error 2";
            },
            add_application:() =>{
                throw "generic db error 3";
            },
            update_application_field: () =>{
                throw "generic db error 4";
            },
            remove_application:() =>{
                throw "generic db error 5";
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())


    let rtr = new applications_router(db)
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(4000);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        let url = endpoints_map.application.prefix + endpoints_map.application.endpoints.hash;
        return request(app.callback())
            .get(url)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("generic db error 0");
            });
    });

    test('load_all', async () => {
        let url = endpoints_map.application.prefix + endpoints_map.application.endpoints.load_all;
        return request(app.callback())
            .get(url)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual('generic db error 1');
            });
    });

    test('get', async () => {
        let path = endpoints_map.application.prefix + endpoints_map.application.endpoints.get;
        path = path.replace(":id", "1");
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 2");
            });
    });

    test('add', async () => {
        let app_obj = {

        };
        let path = endpoints_map.application.prefix + endpoints_map.application.endpoints.add;
        path = path.replace(":id", "5");
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(app_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual('generic db error 3');
            });
    });

    test('delete', async () => {
        let path = endpoints_map.application.prefix + endpoints_map.application.endpoints.delete;
        path = path.replace(":id", "4");
        return request(app.callback())
            .delete(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual('generic db error 5');
            });
    });


    test('edit', async () => {
        let chg = {
            group_name: "test_name",
            group_id: "test_name",
            channels: [],
            default: false
        };

        let edit = {application: 1, item: chg, action: "add", object: "channel_group"};
        let path = endpoints_map.application.prefix + endpoints_map.application.endpoints.get;
        path = path.replace(":id", "1");
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response) => {
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 2");
            });
    });


    afterEach(() => {
    })
    afterAll(() => server.close());
});


