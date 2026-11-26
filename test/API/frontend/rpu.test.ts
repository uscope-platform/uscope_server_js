
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import {database} from "#database";
import {authorizer, error_handler} from "#api_backend";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import {rpu_router, endpoints_map} from "#api_frontend";
import fs from "node:fs";
import {rpu_model} from "#models";
import {createHash} from "node:crypto";


describe('rpu API tests', () => {

    const app = new Koa();

    app.use(bodyParser({jsonLimit:'50mb'}));

    // the content is opaque to the server: any binary file stands in for an elf
    let data = fs.readFileSync(__dirname + "/../../data/mock.bit");
    let hash = createHash('sha256').update(data).digest('hex');

    let programs: rpu_model[] = [
        {
            id:1,
            name:'test_1',
            core:0,
            data: data,
            hash: hash
        },
        {
            id:2,
            name:'test_2',
            core:1,
            data: data,
            hash: hash
        }
    ]
    let results:any = {}
    let db = {
        rpu_programs:{
            get_version: ():string =>{
                return "7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e"
            },
            load_all:() =>{
                return programs
            },
            get_rpu_program:(id:number) =>{
                return {...programs[id-1]}
            },
            add_rpu_program:(prog:any) =>{
                results = prog;
            },
            update_rpu_program_field: (id:number, field_name: string, field_value:any) =>{
                results = [id, field_name, field_value];
            },
            remove_rpu_program:(id:number) =>{
                results = id;
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

    let server = app.listen(3010);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        return request(app.callback())
            .get(endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.hash)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.text).toBe("7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e")
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get(endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.load_all)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual([
                    { id:1, name:'test_1', hash:hash, core:0},
                    { id:2, name:'test_2', hash:hash, core:1}
                ])
            });
    });

    test('get', async () => {

        let path = endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.get;
        path = path.replace(":id", "2");
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body.id).toBe(programs[1].id);
                expect(response.body.name).toBe(programs[1].name);
                expect(response.body.core).toBe(programs[1].core);
                let has_data = response.body.hasOwnProperty("data");
                expect(has_data).toBeFalsy();
                expect(response.body.hash).toBe(programs[1].hash);
            });
    });

    test('get with the program', async () => {

        let path = endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.get;
        path = path.replace(":id", "1");
        return request(app.callback())
            .get(path)
            .query({"export-program":"true"})
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body.core).toBe(programs[0].core);
                expect(response.body.data).toBe(data.toString('base64'));
            });
    });

    test('add', async () => {
        let rpu_obj = {
                id:3,
                name:'test_1',
                core:2,
                data: data.toString('base64'),
                hash: hash
            }

        let path = endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.add;
        path = path.replace(":id", "3");
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(rpu_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results.id).toBe(rpu_obj.id);
                expect(results.name).toBe(rpu_obj.name);
                expect(results.core).toBe(rpu_obj.core);
                let result = Buffer.from(results.data).toString('base64') == Buffer.from(data).toString('base64')
                expect(result).toBeTruthy();
                expect(results.hash).toBe(rpu_obj.hash);
            });
    });

    test('edit', async () => {

        let path = endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.edit;
        path = path.replace(":id", "3");

        let edit = {script:4, field:{name:"name", value:"test edit"}};
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([3, "name", "test edit"])
            });
    });

    test('edit core', async () => {

        let path = endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.edit;
        path = path.replace(":id", "3");

        let edit = {script:4, field:{name:"core", value:5}};
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([3, "core", 5])
            });
    });

    test('edit of a field that cannot be edited', async () => {

        let path = endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.edit;
        path = path.replace(":id", "3");

        results = [];
        let edit = {script:4, field:{name:"hash", value:"forged"}};
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(400);
                expect(results).toStrictEqual([])
            });
    });

    test('delete', async () => {

        let path = endpoints_map.rpu.prefix + endpoints_map.rpu.endpoints.delete;
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
