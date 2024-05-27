import Koa from "koa";
import bodyParser from "koa-bodyparser";
import database from "../../src/Database/Database";
import {authorizer, error_handler} from "../../src/API/backend/middleware";
import request from "supertest";
import { expect} from "@jest/globals";
import jwt from "koa-jwt"
import applications_router from "../../src/API/frontend/applications_api";
import endpoints_map from "../../src/API/frontend/endpoints_map";


describe('applications API tests', () => {


    const app = new Koa();

    app.use(bodyParser());

    let init_app = {
        id: 1,
        application_name:'new application_1',
        bitstream:"",
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
        pl_clocks:{
            "0":100e6,
            "1":100e6,
            "2":100e6,
            "3":100e6,
        },
        parameters:[],
        peripherals:[],
        soft_cores:[],
        filters:[],
        programs:[],
        scripts:[],
        miscellaneous:{
            test_misc_p:123
        }
    }

    let apps: any =  [JSON.parse(JSON.stringify(init_app))];

    let results:any = {}
    let db = {
        applications:{
            get_version: ():string =>{
                return "7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e"
            },
            load_all:() =>{
                return apps
            },
            get_application:(id:number) =>{
                return apps[id-1]
            },
            add_application:(flt:any) =>{
                results = flt;
            },
            update_application_field: (application: any) =>{
                results = application;
            },
            remove_application:(id:number) =>{
                results = id;
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())


    let rtr = new applications_router(db)
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3000);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        let url = endpoints_map.application.prefix + endpoints_map.application.endpoints.hash;
        return request(app.callback())
            .get(url)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.text).toBe("7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e")
            });
    });

    test('load_all', async () => {
        let url = endpoints_map.application.prefix + endpoints_map.application.endpoints.load_all;
        return request(app.callback())
            .get(url)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(apps)
            });
    });

    test('get', async () => {
        let url = endpoints_map.application.prefix + '/1';
        return request(app.callback())
            .get(url)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(apps[0])
            });
    });

    test('add', async () => {
        let app_obj = {
            id: 5,
            application_name:'new application_5',
            bitstream:"",
            channels:[],
            channel_groups:[],
            clock_frequency:100000000,
            initial_registers_values:[],
            macro:[],
            parameters:[],
            peripherals:[],
            soft_cores:[],
            filters:[],
            programs:[],
            scripts:[],
            miscellaneous:{},
            pl_clocks:{
                "0":100e6,
                "1":100e6,
                "2":100e6,
                "3":100e6,
            }
        }
        return request(app.callback())
            .post('/application/5')
            .set('Authorization', `Bearer ${token}`)
            .send(app_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(app_obj)
            });
    });

    test('delete', async () => {
        return request(app.callback())
            .delete('/application/4')
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(4)
            });
    });


    test('edit_add_item', async () => {
        let chg = {
            group_name: "test_name",
            group_id: "test_name",
            channels:[],
            default:false
        };

        let edit = {application:1, item:chg, action:"add", object:"channel_group"};
        return request(app.callback())
            .patch('/application/1')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(
                    {
                        id: 1,
                        application_name:'new application_1',
                        bitstream:"",
                        channels:[],
                        channel_groups:[{
                            group_name: "test group 1",
                            group_id: "test_group_1",
                            channels:[],
                            default:false
                        },
                        {
                            group_name: "test_name",
                            group_id: "test_name",
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
                        },
                        pl_clocks:{
                            "0":100e6,
                            "1":100e6,
                            "2":100e6,
                            "3":100e6,
                        }
                    }
                )
            });
    });

    test('edit_add_item_misc', async () => {
        let edit = {application:1, item:{name:"test param", value:125}, action:"add", object:"misc"};
        return request(app.callback())
            .patch('/application/1')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(
                    {
                        id: 1,
                        application_name:'new application_1',
                        bitstream:"",
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
                            "test param": 125,
                            test_misc_p:123
                        },
                        pl_clocks:{
                            "0":100e6,
                            "1":100e6,
                            "2":100e6,
                            "3":100e6,
                        }
                    })
            });
    });



    test('edit_edit_item', async () => {


        let edit = {
            application:1,
            item:{
                item_id:"test group 1",
                field:"group_id",
                value:"test_edit"
            },
            action:"edit",
            object:"channel_group"
        };
        return request(app.callback())
            .patch('/application/1')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(
                    {
                        id: 1,
                        application_name:'new application_1',
                        bitstream:"",
                        channels:[],
                        channel_groups:[{
                            group_name: "test group 1",
                            group_id: "test_edit",
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
                        },
                        pl_clocks:{
                            "0":100e6,
                            "1":100e6,
                            "2":100e6,
                            "3":100e6,
                        }
                    }
                )
            });
    });

    test('edit_edit_item_misc_name', async () => {

        let edit = {
            application:1,
            item:{
                name:"test_misc_p",
                value:"test_rename",
                edit_name:true
            },
            action:"edit",
            object:"misc"
        };

        return request(app.callback())
            .patch('/application/1')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(
                    {
                        id: 1,
                        application_name:'new application_1',
                        bitstream:"",
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
                            test_rename:123
                        },
                        pl_clocks:{
                            "0":100e6,
                            "1":100e6,
                            "2":100e6,
                            "3":100e6,
                        }
                    })
            });
    });


    test('edit_edit_item_misc_value', async () => {

        let edit = {
            application:1,
            item:{
                name:"test_misc_p",
                value:3,
                edit_name:false
            },
            action:"edit",
            object:"misc"
        };

        return request(app.callback())
            .patch('/application/1')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(
                    {
                        id: 1,
                        application_name:'new application_1',
                        bitstream:"",
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
                            test_misc_p:3
                        },
                        pl_clocks:{
                            "0":100e6,
                            "1":100e6,
                            "2":100e6,
                            "3":100e6,
                        }
                    })
            });
    });


    test('edit_remove_item_misc', async () => {

        let edit = {
            application:1,
            item:"test_misc_p",
            action:"remove",
            object:"misc"
        };

        return request(app.callback())
            .patch('/application/1')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(
                    {
                        id: 1,
                        application_name:'new application_1',
                        bitstream:"",
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
                        miscellaneous:{},
                        pl_clocks:{
                            "0":100e6,
                            "1":100e6,
                            "2":100e6,
                            "3":100e6,
                        }
                    })
            });
    });


    test('edit_remove_item', async () => {

        let edit = {
            application:1,
            item:"test group 1",
            action:"remove",
            object:"channel_group"
        };

        return request(app.callback())
            .patch('/application/1')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(
                    {
                        id: 1,
                        application_name:'new application_1',
                        bitstream:"",
                        channels:[],
                        channel_groups:[],
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
                        },
                        pl_clocks:{
                            "0":100e6,
                            "1":100e6,
                            "2":100e6,
                            "3":100e6,
                        }
                    })
            });
    });




    test('edit_app_name', async () => {

        let edit = {
            application:1,
            item:{
                name:"application_name",
                value:"test_rename",
                edit_name:false
            },
            action:"edit",
            object:"misc"
        };

        return request(app.callback())
            .patch('/application/1')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(
                    {
                        id: 1,
                        application_name:'test_rename',
                        bitstream:"",
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
                        },
                        pl_clocks:{
                            "0":100e6,
                            "1":100e6,
                            "2":100e6,
                            "3":100e6,
                        }
                    })
            });
    });

    test('edit_bitstream', async () => {

        let edit = {
            application:1,
            item:{
                name:"bitstream",
                value:"test.bin",
                edit_name:false
            },
            action:"edit",
            object:"misc"
        };

        return request(app.callback())
            .patch('/application/1')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(
                    {
                        id: 1,
                        application_name:'new application_1',
                        bitstream:"test.bin",
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
                        },
                        pl_clocks:{
                            "0":100e6,
                            "1":100e6,
                            "2":100e6,
                            "3":100e6,
                        }
                    })
            });
    });


    test('edit_pl_clocks', async () => {

        let edit = {
            application:1,
            item:{
                name:"pl_clocks",
                value:123000000,
                edit_name:false,
                item_id:2
            },
            action:"edit",
            object:"misc"
        };

        return request(app.callback())
            .patch('/application/1')
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(
                    {
                        id: 1,
                        application_name:'new application_1',
                        bitstream:"",
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
                        },
                        pl_clocks:{
                            "0":100e6,
                            "1":100e6,
                            "2":123e6,
                            "3":100e6,
                        }
                    })
            });
    });

    afterEach(() => {
        results = undefined;
        apps = [JSON.parse(JSON.stringify(init_app))]
    })
    afterAll(() => server.close());
});


