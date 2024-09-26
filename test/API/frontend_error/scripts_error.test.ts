import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../../src/Database/Database";
import {authorizer, error_handler} from "../../../src/API/backend/middleware";
import scripts_router from "../../../src/API/frontend/scripts_api";
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
            get_script:(id:number) =>{
                throw "generic db error 62";
            },
            add_script:(scr:any) =>{
                throw "generic db error 63";
            },
            update_script_field: (id:number, field_name: string, field_value:any) =>{
                throw "generic db error 64";
            },
            remove_script:(id:number) =>{
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
            .get('/script/hash')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
            expect(response.status).toBe(501);
            expect(response.text).toBe("generic db error 60");
        });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get('/script/load_all')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 61");
            });
    });

    test('get', async () => {
        return request(app.callback())
            .get('/script/1')
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
        return request(app.callback())
            .post('/script/3')
            .set('Authorization', `Bearer ${token}`)
            .send(script_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 63");
            });
    });

    test('edit', async () => {
            let edit = {script:2, field:"content", value:"test_content"};
            return request(app.callback())
                .patch('/script/2')
                .set('Authorization', `Bearer ${token}`)
                .send(edit)
                .then((response)=>{
                    expect(response.status).toBe(501);
                    expect(response.text).toStrictEqual("generic db error 64");
                });
    });

    test('delete', async () => {
        return request(app.callback())
            .delete('/script/3')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 65");
            });
    });

    afterAll(() => server.close());
});
