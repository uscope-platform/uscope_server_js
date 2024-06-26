import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../src/Database/Database";
import {authorizer, error_handler} from "../../src/API/backend/middleware";
import jwt from "koa-jwt"
import operations_router from "../../src/API/frontend/operations_api";
import fs from "node:fs";
import {createHash} from "node:crypto";
import request from "supertest";
import {expect} from "@jest/globals";



describe('Operation API tests', () => {


    let data = fs.readFileSync(__dirname + "/../data/mock.bit");
    let hash = createHash('sha256').update(data).digest('hex');

    const app = new Koa();

    let init_app = {id: 1,
        application_name:'new application_1',
        bitstream:"test_bitstream",
        channels:[],
        channel_groups:[{
            group_name: "test group 1",
            group_id: "test_group_1",
            channels:[],
            default:false
        }],
        clock_frequency:100000000,
        initial_registers_values:[],
        macro:[{
            address:0x213,
            value:0
        }],
        parameters:[],
        peripherals:[],
        soft_cores:[],
        filters:[],
        programs:[],
        scripts:[],
        miscellaneous:{
            test_misc_p:123
        }}

    app.use(bodyParser());
    let results = {app_id:0, bitstream:""};
    let db = {
        applications:{
            get_application:(id:number)=>{
                results.app_id = id;
                return init_app
            }
        },
        bitstreams:{
            get_by_path:(path:string)=>{
                results.bitstream = path;
                return {
                    id:2,
                    path:'test_2',
                    data: data,
                    hash: hash
                }
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())

    let driver_host = "";
    let driver_port = 0;
    let rtr = new operations_router(db,driver_host, driver_port)
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3009);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('load_application', async () => {
        let router = rtr as any;
        let mock_results = {app:{}, bit:{data:{}}};
        const spy = jest.spyOn(router.ops_backend, 'load_application').mockImplementation(
            (app:any, bit:any) => {
                mock_results.app = app;
                mock_results.bit = bit;
            });
        return request(app.callback())
            .get('/operations/load_application/1')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual( {app_id:1, bitstream:"test_bitstream"})
                expect(spy).toBeCalledTimes(1);
                expect(mock_results.app).toStrictEqual(init_app);
                expect(data.equals(<Buffer>mock_results.bit.data)).toBeTruthy();
            });
    });

    test('write_register', async () => {

    });

    test('read_register', async () => {

    });


    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });


    afterAll(() => server.close());
});
