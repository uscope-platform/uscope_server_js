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

    let emulators: any = [
        {
            "name": "Includes test",
            "cores": {
                "1": {
                    "id": 1,
                    "name": "test_core",
                    "order": 1,
                    "inputs": [],
                    "options": {
                        "comparators": "reducing",
                        "efi_implementation": "efi_trig"
                    },
                    "outputs": [
                        {
                            "name": "sin_t",
                            "type": "float",
                            "reg_n": 12,
                            "register_type": "scalar"
                        },
                        {
                            "name": "cos_t",
                            "type": "float",
                            "reg_n": 13,
                            "register_type": "scalar"
                        }
                    ],
                    "program": "test_header",
                    "channels": 1,
                    "input_data": [],
                    "memory_init": [],
                    "multirate_divisor": 0
                }
            },
            "id": 1,
            "connections": [],
            "n_cycles": 1,
            "async_multirate": false
        }
        ];

    let results:any = {}
    let db = {
        emulators:{
            get_version: ():string =>{
                return "7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e"
            },
            load_all:() =>{
                return emulators
            },
            get_emulator:(id:number) =>{
                return emulators[id-1]
            },
            add_emulator:(flt:any) =>{
                results = flt;
            },
            update_emulator_field: (id:number, field_name: string, field_value:any) =>{
                results = [id, field_name, field_value];
            },
            remove_emulator:(id:number) =>{
                results = id;
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
                expect(response.status).toBe(200);
                expect(response.text).toBe("7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e")
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get('/emulator/load_all')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(emulators)
            });
    });

    test('get', async () => {
        return request(app.callback())
            .get('/emulator/1')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(emulators[0])
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
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(filter_obj)
            });
    });

    test('edit', async () => {
        let edit = {emulator:4, field:"name", value:"tgag"};
        return request(app.callback())
            .patch('/emulator/4')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([4, "name", "tgag"])
            });
    });

    test('delete', async () => {
        return request(app.callback())
            .delete('/emulator/4')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(4)
            });
    });

    afterAll(() => server.close());
});
