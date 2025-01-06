import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../../src/Database/Database";
import {authorizer, error_handler} from "../../../src/API/backend";
import scripts_router from "../../../src/API/frontend/scripts_api";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import endpoints_map from "../../../src/API/frontend/endpoints_map";



describe('script API tests', () => {


    const app = new Koa();

    app.use(bodyParser());

    let scripts = [
        {
            "id": 1,
            "name": "new script_1",
            "path": null,
            "content": "console.log(\"t\")",
            "triggers": "test_trigger"
        },
        {
            "id": 2,
            "name": "new script_2",
            "path": null,
            "content": "",
            "triggers": ""
        }];

    let results:any = {}
    let db = {
        scripts:{
            get_version: ():string =>{
                return "7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e"
            },
            load_all:() =>{
                return scripts
            },
            get_script:(id:number) =>{
                return scripts[id-1]
            },
            add_script:(scr:any) =>{
                results = scr;
            },
            update_script_field: (id:number, field_name: string, field_value:any) =>{
                results = [id, field_name, field_value];
            },
            remove_script:(id:number) =>{
                results = id;
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
            expect(response.status).toBe(200);
            expect(response.text).toBe("7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e")
        });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get(endpoints_map.script.prefix + endpoints_map.script.endpoints.load_all)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(scripts)
            });
    });

    test('get', async () => {
        let path = endpoints_map.script.prefix + endpoints_map.script.endpoints.get;
        path = path.replace(":id", "1");
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(scripts[0])
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
        path = path.replace(":id", "3");
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(script_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(script_obj)
            });
    });

    test('edit', async () => {
        let edit = {script:2, field:"content", value:"test_content"};
        let path = endpoints_map.script.prefix + endpoints_map.script.endpoints.edit;
        path = path.replace(":id", "2");
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([2, "content", "test_content"])
            });
    });

    test('delete', async () => {
        let path = endpoints_map.script.prefix + endpoints_map.script.endpoints.delete;
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
