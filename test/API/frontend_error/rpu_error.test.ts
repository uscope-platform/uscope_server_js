import Koa from "koa";
import bodyParser from "koa-bodyparser";
import {database} from "#database";
import {authorizer, error_handler} from "#api_backend";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import {rpu_router, endpoints_map} from "#api_frontend";
import fs from "node:fs";
import {createHash} from "node:crypto";


describe('rpu API error handling tests', () => {

    const app = new Koa();

    app.use(bodyParser({jsonLimit:'50mb'}));

    let data = fs.readFileSync(__dirname + "/../../data/mock.bit");
    let hash = createHash('sha256').update(data).digest('hex');

    let db = {
        rpu_programs:{
            get_version: ():string =>{
                throw "generic db error 10"
            },
            load_all:() =>{
                throw "generic db error 11"
            },
            get_rpu_program:() =>{
                throw "generic db error 12"
            },
            add_rpu_program:() =>{
                throw "generic db error 13"
            },
            update_rpu_program_field: () =>{
                throw "generic db error 14"
            },
            remove_rpu_program:() =>{
                throw "generic db error 15"
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())


    let rtr = new rpu_router(db)
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(4010);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        return request(app.callback())
            .get(endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.hash)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.body.message).toBe("generic db error 10");
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get(endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.load_all)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.body.message).toStrictEqual("generic db error 11");
            });
    });

    test('get', async () => {
        let path = endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.get;
        path = path.replace(':id', '1')
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.body.message).toBe("generic db error 12");
            });
    });

    test('add', async () => {
        let rpu_obj = {
                id:3,
                name:'test_1',
                core:0,
                data:  'data:test;base64,' + data.toString('base64'),
                hash: hash
            }
        let path = endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.add;
        path = path.replace(':id', '3')
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(rpu_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.body.message).toBe("generic db error 13");
            });
    });

    test('edit', async () => {
        let edit = {script:4, field:{name:"core", value:1}};
        let path = endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.edit;
        path = path.replace(':id', '3')
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.body.message).toStrictEqual("generic db error 14");
            });
    });

    test('delete', async () => {
        let path = endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.delete;
        path = path.replace(':id', '3')
        return request(app.callback())
            .delete(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.body.message).toStrictEqual("generic db error 15");
            });
    });

    afterAll(() => server.close());
});
