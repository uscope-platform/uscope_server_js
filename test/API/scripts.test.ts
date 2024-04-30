import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../src/Database/Database";
import {authorizer, error_handler} from "../../src/API/backend/middleware";
import scripts_router from "../../src/API/frontend/scripts_api";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"



describe('script tests', () => {


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
    let tokens:any = {}
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

    let server = app.listen(3000);
    
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        return request(app.callback())
            .get('/script/hash')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
            expect(response.status).toBe(200);
            expect(response.text).toBe("7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e")
        });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get('/script/load_all')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(scripts)
            });
    });

    test('get', async () => {
        return request(app.callback())
            .get('/script/1')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(scripts[0])
            });
    });

    test('add', async () => {

    });

    test('edit', async () => {

    });

    test('delete', async () => {

    });

    afterAll(() => server.close());
});
