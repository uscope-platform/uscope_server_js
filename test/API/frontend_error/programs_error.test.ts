import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../../src/Database/Database";
import {authorizer, error_handler} from "../../../src/API/backend";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import programs_router from "../../../src/API/frontend/programs_api";
import endpoints_map from "../../../src/API/frontend/endpoints_map";



describe('programs API error handling tests', () => {


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
            get_program:() =>{
                throw "generic db error 52";
            },
            add_program:() =>{
                throw "generic db error 53";
            },
            update_program_field: () =>{
                throw "generic db error 54";
            },
            remove_program:() =>{
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
            .get(endpoints_map.program.prefix + endpoints_map.program.endpoints.hash)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
            expect(response.status).toBe(501);
            expect(response.text).toBe("generic db error 50");
        });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get(endpoints_map.program.prefix + endpoints_map.program.endpoints.load_all)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 51");
            });
    });

    test('get', async () => {
        let path = endpoints_map.program.prefix + endpoints_map.program.endpoints.get;
        path = path.replace(':id', '1')
        return request(app.callback())
            .get(path)
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
        let path = endpoints_map.program.prefix + endpoints_map.program.endpoints.add;
        path = path.replace(':id', '3')
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(program_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 53");
            });
    });

    test('edit', async () => {
            let edit = {script:4, field:"content", value:"test_content"};
        let path = endpoints_map.program.prefix + endpoints_map.program.endpoints.edit;
        path = path.replace(':id', '4')
            return request(app.callback())
                .patch(path)
                .set('Authorization', `Bearer ${token}`)
                .send(edit)
                .then((response)=>{
                    expect(response.status).toBe(501);
                    expect(response.text).toStrictEqual("generic db error 54");
                });
    });

    test('delete', async () => {
        let path = endpoints_map.program.prefix + endpoints_map.program.endpoints.delete;
        path = path.replace(':id', '3')
        return request(app.callback())
            .delete(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 55");
            });
    });

    afterAll(() => server.close());
});
