import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../src/Database/Database";
import {authorizer, error_handler} from "../../src/API/backend/middleware";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import peripherals_router from "../../src/API/frontend/peripherals_api";
import filters_router from "../../src/API/frontend/filters_api";



describe('filters API tests', () => {


    const app = new Koa();

    app.use(bodyParser());

    let filters: any = [
        {
            "id":1,
            "name": "Filter 1",
            "parameters": {
                "type": "lp",
                "n_taps": 130,
                "taps_width": 16,
                "pass_band_edge_1": 0,
                "pass_band_edge_2": 0,
                "stop_band_edge_1": 0,
                "stop_band_edge_2": 0,
                "sampling_frequency": 0
            },
            "ideal_taps": [],
            "quantized_taps": []
        },{
            "id": 2,
            "name": "test_2",
            "parameters": {
                "type": "bp",
                "n_taps": 100,
                "taps_width": 13,
                "pass_band_edge_1": 600,
                "pass_band_edge_2": 700,
                "stop_band_edge_1": 500,
                "stop_band_edge_2": 800,
                "sampling_frequency": 3000
            },
            "ideal_taps": [-0.000045195506, 0.00290487418, -0.0000067935, 0.000073226, 0.0002756006],
            "quantized_taps": [0, 0, 0, 1, 2,0]
        }
        ];

    let results:any = {}
    let db = {
        filters:{
            get_version: ():string =>{
                return "7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e"
            },
            load_all:() =>{
                return filters
            },
            get_filter:(id:number) =>{
                return filters[id-1]
            },
            add_filter:(flt:any) =>{
                results = flt;
            },
            update_filter_field: (id:number, field_name: string, field_value:any) =>{
                results = [id, field_name, field_value];
            },
            remove_filter:(id:number) =>{
                results = id;
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
                expect(response.status).toBe(200);
                expect(response.text).toBe("7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e")
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get('/filter/load_all')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(filters)
            });
    });

    test('get', async () => {
        return request(app.callback())
            .get('/filter/2')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(filters[1])
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
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(filter_obj)
            });
    });

    test('edit', async () => {
        let edit = {script:4, field:"name", value:"tgag"};
        return request(app.callback())
            .patch('/filter/4')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([4, "name", "tgag"])
            });
    });

    test('delete', async () => {
        return request(app.callback())
            .delete('/filter/4')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(4)
            });
    });

    afterAll(() => server.close());
});
