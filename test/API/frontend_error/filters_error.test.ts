import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../../src/Database/Database";
import {authorizer, error_handler} from "../../../src/API/backend/middleware";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import filters_router from "../../../src/API/frontend/filters_api";



describe('filters API tests', () => {


    const app = new Koa();

    app.use(bodyParser());

    let db = {
        filters:{
            get_version: ():string =>{
                throw "generic db error 30"
            },
            load_all:() =>{
                throw "generic db error 31"
            },
            get_filter:(id:number) =>{
                throw "generic db error 32"
            },
            add_filter:(flt:any) =>{
                throw "generic db error 33"
            },
            update_filter_field: (id:number, field_name: string, field_value:any) =>{
                throw "generic db error 34"
            },
            remove_filter:(id:number) =>{
                throw "generic db error 35"
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())


    let rtr = new filters_router(db)
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3001);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        return request(app.callback())
            .get('/filter/hash')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("generic db error 30");
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get('/filter/load_all')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 31");
            });
    });

    test('get', async () => {
        return request(app.callback())
            .get('/filter/2')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 32");
            });
    });

    test('add', async () => {
        let filter_obj = {
            id:5,
            name:'new filter_4',
            parameters:{
                type:"lp",
                n_taps:100,
                pass_band_edge_1:0,
                stop_band_edge_1:0,
                pass_band_edge_2:0,
                stop_band_edge_2:0,
                sampling_frequency:0,
                taps_width:16
            }
        }
        return request(app.callback())
            .post('/filter/54')
            .set('Authorization', `Bearer ${token}`)
            .send(filter_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 33");
            });
    });

    test('edit', async () => {
        let edit = {script:4, field:"name", value:"tgag"};
        return request(app.callback())
            .patch('/filter/4')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 34");
            });
    });

    test('delete', async () => {
        return request(app.callback())
            .delete('/filter/4')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 35");
            });
    });

    afterAll(() => server.close());
});
