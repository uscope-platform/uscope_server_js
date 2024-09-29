import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../../src/Database/Database";
import {authorizer, error_handler} from "../../../src/API/backend/middleware";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import bitstream_router from "../../../src/API/frontend/bitstreams_api";
import fs from "node:fs";
import {createHash} from "node:crypto";
import endpoints_map from "../../../src/API/frontend/endpoints_map";



describe('bitstream API error handlong tests', () => {

    const app = new Koa();

    app.use(bodyParser({jsonLimit:'50mb'}));

    let data = fs.readFileSync(__dirname + "/../../data/mock.bit");
    let hash = createHash('sha256').update(data).digest('hex');

    let db = {
        bitstreams:{
            get_version: ():string =>{
                throw "generic db error 10"
            },
            load_all:() =>{
                throw "generic db error 11"
            },
            get_bitstream:() =>{
                throw "generic db error 12"
            },
            add_bitstream:() =>{
                throw "generic db error 13"
            },
            update_bitstream_field: () =>{
                throw "generic db error 14"
            },
            remove_bitstream:() =>{
                throw "generic db error 15"
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())


    let rtr = new bitstream_router(db)
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(4007);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        return request(app.callback())
            .get(endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.hash)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("generic db error 10");
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get(endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.load_all)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 11");
            });
    });

    test('get', async () => {
        let path = endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.get;
        path = path.replace(':id', '1')
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("generic db error 12");
            });
    });

    test('add', async () => {
        let bitstream_obj = {
                id:3,
                path:'test_1',
                data: data,
                hash: hash
            }
        let path = endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.add;
        path = path.replace(':id', '3')
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(bitstream_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("generic db error 13");
            });
    });

    test('edit', async () => {
        let edit = {script:4, field:"path", value:"test edit"};
        let path = endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.edit;
        path = path.replace(':id', '3')
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 14");
            });
    });

    test('delete', async () => {
        let path = endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.delete;
        path = path.replace(':id', '3')
        return request(app.callback())
            .delete(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 15");
            });
    });

    afterAll(() => server.close());
});
