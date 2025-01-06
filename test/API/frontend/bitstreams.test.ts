import Koa from "koa";
import bodyParser from "koa-bodyparser";
import {database} from "#database";
import {authorizer, error_handler} from "#api_backend";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import {bitstream_router, endpoints_map} from "#api_frontend";
import fs from "node:fs";
import {bitstream_model} from "#models";
import {createHash} from "node:crypto";


describe('bitstream API tests', () => {

    const app = new Koa();

    app.use(bodyParser({jsonLimit:'50mb'}));

    let data = fs.readFileSync(__dirname + "/../../data/mock.bit");
    let hash = createHash('sha256').update(data).digest('hex');

    let bitstreams: bitstream_model[] = [
        {
            id:1,
            name:'test_1',
            data: data,
            hash: hash
        },
        {
            id:2,
            name:'test_2',
            data: data,
            hash: hash
        }
    ]
    let results:any = {}
    let db = {
        bitstreams:{
            get_version: ():string =>{
                return "7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e"
            },
            load_all:() =>{
                return bitstreams
            },
            get_bitstream:(id:number) =>{
                return bitstreams[id-1]
            },
            add_bitstream:(scr:any) =>{
                results = scr;
            },
            update_bitstream_field: (id:number, field_name: string, field_value:any) =>{
                results = [id, field_name, field_value];
            },
            remove_bitstream:(id:number) =>{
                results = id;
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

    let server = app.listen(3007);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        return request(app.callback())
            .get(endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.hash)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.text).toBe("7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e")
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get(endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.load_all)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual([{ id:1, name:'test_1'}, { id:2, name:'test_2'} ])
            });
    });

    test('get', async () => {

        let path = endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.get;
        path = path.replace(":id", "1");
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body.id).toBe(bitstreams[0].id);
                expect(response.body.name).toBe(bitstreams[0].name);
                let has_data = response.body.hasOwnProperty("data");
                expect(has_data).toBeFalsy();
                expect(response.body.hash).toBe(bitstreams[0].hash);
            });
    });

    test('add', async () => {
        let bitstream_obj = {
                id:3,
                name:'test_1',
                data: data.toString('base64'),
                hash: hash
            }

        let path = endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.add;
        path = path.replace(":id", "3");
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(bitstream_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results.id).toBe(bitstream_obj.id);
                expect(results.name).toBe(bitstream_obj.name);
                let result = Buffer.from(results.data).toString('base64') == Buffer.from(data).toString('base64')
                expect(result).toBeTruthy();
                expect(results.hash).toBe(bitstream_obj.hash);
            });
    });

    test('edit', async () => {

        let path = endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.edit;
        path = path.replace(":id", "3");

        let edit = {script:4, field:{name:"path", value:"test edit"}};
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([3, "path", "test edit"])
            });
    });

    test('delete', async () => {

        let path = endpoints_map.bitstream.prefix + endpoints_map.bitstream.endpoints.delete;
        path = path.replace(":id", "3");
        return request(app.callback())
            .delete(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(3)
            });
    });

    afterAll(() => server.close());
});
