import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../../src/Database/Database";
import {authorizer, error_handler} from "../../../src/API/backend/middleware";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import emulators_router from "../../../src/API/frontend/emulators_api";



describe('emulators API tests', () => {


    const app = new Koa();

    app.use(bodyParser());

    let db = {
        emulators:{
            get_version: ():string =>{
                throw "generic db error 20";
            },
            load_all:() =>{
                throw "generic db error 21";
            },
            get_emulator:(id:number) =>{
                throw "generic db error 22";
            },
            add_emulator:(flt:any) =>{
                throw "generic db error 23";
            },
            update_emulator_field: (id:number, field_name: string, field_value:any) =>{
                throw "generic db error 24";
            },
            remove_emulator:(id:number) =>{
                throw "generic db error 25";
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())


    let rtr = new emulators_router(db)
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3004);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        return request(app.callback())
            .get('/emulator/hash')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("generic db error 20");
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get('/emulator/load_all')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 21");
            });
    });

    test('get', async () => {
        return request(app.callback())
            .get('/emulator/1')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 22");
            });
    });

    test('add', async () => {
        let filter_obj =  {
            id:4,
            name:'new_emulator_4',
            cores:{},
            connections:[],
            n_cycles:1,
            async_multirate:false
        }
        return request(app.callback())
            .post('/emulator/5')
            .set('Authorization', `Bearer ${token}`)
            .send(filter_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual('generic db error 23');
            });
    });

    test('edit', async () => {
        let edit = {emulator:4, field:"name", value:"tgag"};
        return request(app.callback())
            .patch('/emulator/4')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual('generic db error 24');
            });
    });

    test('delete', async () => {
        return request(app.callback())
            .delete('/emulator/4')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual('generic db error 25');
            });
    });

    afterAll(() => server.close());
});