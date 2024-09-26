import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../../src/Database/Database";
import {authorizer, error_handler} from "../../../src/API/backend/middleware";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import peripherals_router from "../../../src/API/frontend/peripherals_api";



describe('peripherals API tests', () => {

    const app = new Koa();

    app.use(bodyParser());

    let db = {
        peripherals:{
            get_version: ():string =>{
                throw "generic db error 40";
            },
            load_all:() =>{
                throw "generic db error 41";
            },
            get_peripheral:(id:number) =>{
                throw "generic db error 42";
            },
            add_peripheral:(scr:any) =>{
                throw "generic db error 43";
            },
            update_peripheral_field: (id:number, field_name: string, field_value:any) =>{
                throw "generic db error 44";
            },
            remove_peripheral:(id:number) =>{
                throw "generic db error 45";
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())


    let rtr = new peripherals_router(db)
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3003);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        return request(app.callback())
            .get('/peripheral/hash')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("generic db error 40");
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get('/peripheral/load_all')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 41");
            });
    });

    test('get', async () => {
        return request(app.callback())
            .get('/peripheral/1')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 42");
            });
    });

    test('add', async () => {
        let peripheral_obj = {
            id:54,
            peripheral_name: 'new peripheral_' + 54,
            version:0.1,
            registers:[],
            parametric:false
        }
        return request(app.callback())
            .post('/peripheral/54')
            .set('Authorization', `Bearer ${token}`)
            .send(peripheral_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 43");
            });
    });

    test('edit', async () => {
        let edit = {script:4, field:"parametric", value:false};
        return request(app.callback())
            .patch('/peripheral/54')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 44");
            });
    });

    test('delete', async () => {
        return request(app.callback())
            .delete('/peripheral/54')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 45");
            });
    });

    afterAll(() => server.close());
});
