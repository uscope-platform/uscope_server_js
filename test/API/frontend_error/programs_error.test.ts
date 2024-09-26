import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../../src/Database/Database";
import {authorizer, error_handler} from "../../../src/API/backend/middleware";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import programs_router from "../../../src/API/frontend/programs_api";



describe('programs API tests', () => {


    const app = new Koa();

    app.use(bodyParser());

    let db = {
        programs:{
            get_version: ():string =>{
                throw "generic db error 50";
            },
            load_all:() =>{
                throw "generic db error 51";
            },
            get_program:(id:number) =>{
                throw "generic db error 52";
            },
            add_program:(scr:any) =>{
                throw "generic db error 53";
            },
            update_program_field: (id:number, field_name: string, field_value:any) =>{
                throw "generic db error 54";
            },
            remove_program:(id:number) =>{
                throw "generic db error 55";
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())


    let rtr = new programs_router(db)
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3005);
    
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        return request(app.callback())
            .get('/program/hash')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
            expect(response.status).toBe(501);
            expect(response.text).toBe("generic db error 50");
        });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get('/program/load_all')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 51");
            });
    });

    test('get', async () => {
        return request(app.callback())
            .get('/program/1')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 52");
            });
    });

    test('add', async () => {
        let program_obj = {
            "id": 4,
            "name": "test",
            "content": "void main(){}",
            "type": "C",
            "hex": [],
            "build_settings": {"io": {"inputs": [], "outputs": [],"memories": []}},
            "cached_bin_version": "",
            "headers": []
        }
        return request(app.callback())
            .post('/program/3')
            .set('Authorization', `Bearer ${token}`)
            .send(program_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 53");
            });
    });

    test('edit', async () => {
            let edit = {script:4, field:"content", value:"test_content"};
            return request(app.callback())
                .patch('/program/4')
                .set('Authorization', `Bearer ${token}`)
                .send(edit)
                .then((response)=>{
                    expect(response.status).toBe(501);
                    expect(response.text).toStrictEqual("generic db error 54");
                });
    });

    test('delete', async () => {
        return request(app.callback())
            .delete('/program/3')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 55");
            });
    });

    afterAll(() => server.close());
});
