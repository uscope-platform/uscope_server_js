import Koa from "koa";
import bodyParser from "koa-bodyparser";
import {database} from "../../../src/Database";
import {authorizer, error_handler} from "../../../src/API/backend";
import {scripts_router, endpoints_map} from "../../../src/API/frontend";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"



describe('script API error handling tests', () => {


    const app = new Koa();

    app.use(bodyParser());

    let db = {
        scripts:{
            get_version: ():string =>{
                throw "generic db error 60";
            },
            load_all:() =>{
                throw "generic db error 61";
            },
            get_script:() =>{
                throw "generic db error 62";
            },
            add_script:() =>{
                throw "generic db error 63";
            },
            update_script_field: () =>{
                throw "generic db error 64";
            },
            remove_script:() =>{
                throw "generic db error 65";
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())


    let rtr = new scripts_router(db)
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3002);
    
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        return request(app.callback())
            .get(endpoints_map.script.prefix + endpoints_map.script.endpoints.hash)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
            expect(response.status).toBe(501);
            expect(response.text).toBe("generic db error 60");
        });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get(endpoints_map.script.prefix + endpoints_map.script.endpoints.load_all)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 61");
            });
    });

    test('get', async () => {
        let path = endpoints_map.script.prefix + endpoints_map.script.endpoints.get;
        path = path.replace(':id', '1')
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 62");
            });
    });

    test('add', async () => {
        let script_obj = {
            "id": 3,
            "name": "new script_3",
            "path": null,
            "content": "",
            "triggers": ""
        }
        let path = endpoints_map.script.prefix + endpoints_map.script.endpoints.add;
        path = path.replace(':id', '3')
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(script_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 63");
            });
    });

    test('edit', async () => {
            let edit = {script:2, field:"content", value:"test_content"};
            let path = endpoints_map.script.prefix + endpoints_map.script.endpoints.edit;
            path = path.replace(':id', '2')
            return request(app.callback())
                .patch(path)
                .set('Authorization', `Bearer ${token}`)
                .send(edit)
                .then((response)=>{
                    expect(response.status).toBe(501);
                    expect(response.text).toStrictEqual("generic db error 64");
                });
    });

    test('delete', async () => {
        let path = endpoints_map.script.prefix + endpoints_map.script.endpoints.delete;
        path = path.replace(':id', '3')
        return request(app.callback())
            .delete(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 65");
            });
    });

    afterAll(() => server.close());
});
