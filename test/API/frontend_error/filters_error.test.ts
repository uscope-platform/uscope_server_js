import Koa from "koa";
import bodyParser from "koa-bodyparser";
import {database} from "../../../src/Database";
import {authorizer, error_handler} from "../../../src/API/backend";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import {filters_router, endpoints_map} from "../../../src/API/frontend";



describe('filters API error handling tests', () => {


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
            get_filter:() =>{
                throw "generic db error 32"
            },
            add_filter:() =>{
                throw "generic db error 33"
            },
            update_filter_field: () =>{
                throw "generic db error 34"
            },
            remove_filter:() =>{
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
            .get(endpoints_map.filter.prefix + endpoints_map.filter.endpoints.hash)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toBe("generic db error 30");
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get(endpoints_map.filter.prefix + endpoints_map.filter.endpoints.load_all)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 31");
            });
    });

    test('get', async () => {
        let path = endpoints_map.filter.prefix + endpoints_map.filter.endpoints.get;
        path = path.replace(':id', '2')
        return request(app.callback())
            .get(path)
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
        let path = endpoints_map.filter.prefix + endpoints_map.filter.endpoints.add;
        path = path.replace(':id', '54')
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(filter_obj)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 33");
            });
    });

    test('edit', async () => {
        let edit = {script:4, field:"name", value:"tgag"};
        let path = endpoints_map.filter.prefix + endpoints_map.filter.endpoints.edit;
        path = path.replace(':id', '4')
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 34");
            });
    });

    test('delete', async () => {
        let path = endpoints_map.filter.prefix + endpoints_map.filter.endpoints.delete;
        path = path.replace(':id', '4')
        return request(app.callback())
            .delete(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(501);
                expect(response.text).toStrictEqual("generic db error 35");
            });
    });

    afterAll(() => server.close());
});
