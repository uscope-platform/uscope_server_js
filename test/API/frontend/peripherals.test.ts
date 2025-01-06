import Koa from "koa";
import bodyParser from "koa-bodyparser";
import {authorizer, error_handler} from "#api_backend";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import {database} from "#database";
import {peripherals_router, endpoints_map} from "#api_frontend";
import {field_model, register_model} from "#models";



describe('peripherals API tests', () => {

    const app = new Koa();

    app.use(bodyParser());

    let peripherals: any = [
        {
            "name": "gpio",
            "image": "",
            "parametric": false,
            "version": "1.0",
            "registers": [
                {
                    "ID": "out",
                    "fields": [],
                    "offset": "0x0",
                    "direction": "RW",
                    "description": "Output Register",
                    "register_name": "out"
                },
                {
                    "ID": "in",
                    "fields": [],
                    "offset": "0x4",
                    "direction": "R",
                    "description": "Input Register",
                    "register_name": "in"
                }
            ],
            "id": 1
        },
        {
            "name": "axis_dynamic_data_mover",
            "image": "",
            "parametric": true,
            "version": "1.0",
            "registers": [
                {
                    "ID": "n_channels",
                    "order": 0,
                    "fields": [],
                    "direction": "RW",
                    "description": "number of active DMA channels",
                    "n_registers": [
                        "1"
                    ],
                    "register_name": "n_channels"
                },
                {
                    "ID": "addr_$",
                    "order": 1,
                    "fields": [
                        {
                            "name": "src",
                            "order": 0,
                            "length": 16,
                            "offset": 0,
                            "n_fields": [
                                "1"
                            ],
                            "description": "Source address"
                        },
                        {
                            "name": "burst_mode",
                            "order": 1,
                            "length": 15,
                            "offset": 15,
                            "n_fields": [
                                "1"
                            ],
                            "description": "Destination address"
                        }
                    ],
                    "direction": "RW",
                    "description": "This register selects source and target address for channel $",
                    "n_registers": [
                        "MAX_STEPS"
                    ],
                    "register_name": "addr_$"
                }
            ],
            "id": 2
        }
        ];

    let results:any = {}
    let db = {
        peripherals:{
            get_version: ():string =>{
                return "7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e"
            },
            load_all:() =>{
                return peripherals
            },
            get_peripheral:(id:number) =>{
                return peripherals[id-1]
            },
            add_peripheral:(scr:any) =>{
                results = scr;
            },
            add_register:(id:number, reg:any)=>{
                results = [id, reg];
            },
            edit_register:(id:number, reg:any)=>{
                results = [id, reg];
            },
            remove_register:(id:number, reg_id:string)=>{
                results = [id, reg_id];
            },
            add_field:(per_id:number, reg_id:string, field:any)=>{
                results = [per_id, reg_id, field];
            },
            edit_field:(per_id:number, reg_id:string, field:any)=>{
                results = [per_id, reg_id, field];
            },
            remove_field:(per_id:number, reg_id:string, fld_id:string)=>{
                results = [per_id, reg_id, fld_id];
            },
            update_peripheral_field: (id:number, field_name: string, field_value:any) =>{
                results = [id, field_name, field_value];
            },
            remove_peripheral:(id:number) =>{
                results = id;
            }
        }
    } as any as database

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())


    let rtr = new peripherals_router(db)
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3003);

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    test('hash', async () => {
        return request(app.callback())
            .get(endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.hash)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.text).toBe("7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e")
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get(endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.load_all)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(peripherals)
            });
    });

    test('get', async () => {
        let path = endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.get;
        path = path.replace(":id", "1")
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(peripherals[0])
            });
    });

    test('add', async () => {
        let peripheral_obj = {
            id:54,
            peripheral_name: 'new peripheral_' + 54,
            version:0.1,
            registers:[],
            parametric:false
        }
        let path = endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.add;
        path = path.replace(":id", "54")
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(peripheral_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(peripheral_obj)
            });
    });

    test('add_fail', async () => {
        let peripheral_obj = {
            id:54,
            peripheral_name: 'new peripheral_' + 54
        }
        let path = endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.add;
        path = path.replace(":id", "54")
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(peripheral_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(peripheral_obj)
            });
    });

    test('edit', async () => {
        let edit = {peripheral:4, field:"parametric", value:false};
        let path = endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.edit;
        path = path.replace(":id", "54")
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([54, "parametric", false])
            });
    });


    test('add_register', async () => {
        let reg : register_model = {
            ID:"reg_id",
            description:"desc",
            direction:"RW",
            offset:"0x0",
            register_name:"reg_name",
            value:0,
            fields:[]
        };
        let edit = {peripheral:4, field:"register", action:"add", value:reg};
        let path = endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.edit;
        path = path.replace(":id", "54")
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([54, reg])
            });
    });

    test('edit_register', async () => {
        let reg : register_model = {
            ID:"reg_id",
            description:"desc",
            direction:"RW",
            offset:"0x0",
            register_name:"reg_name",
            value:0,
            fields:[]
        };
        let edit = {peripheral:4, field:"register", action:"edit", value:reg};
        let path = endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.edit;
        path = path.replace(":id", "54")
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([54, reg])
            });
    });

    test('remove_register', async () => {
        let edit = {peripheral:4, field:"register", action:"remove", value:"reg_id"};
        let path = endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.edit;
        path = path.replace(":id", "54")
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([54, "reg_id"])
            });
    });

    test('add_field', async () => {
        let fld : field_model = {
            name:"field",
            description:"desc",
            length:1,
            offset:8
        };
        let edit = {peripheral:4, field:"field", action:"add", value: {id:"sfa", object:fld}};
        let path = endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.edit;
        path = path.replace(":id", "54")
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([54, "sfa", fld])
            });
    });

    test('edit_field', async () => {
        let fld : field_model = {
            name:"field",
            description:"desc",
            length:1,
            offset:8
        };
        let edit = {peripheral:4, field:"field", action:"edit", value: {id:"sfa", object:fld}};
        let path = endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.edit;
        path = path.replace(":id", "54")
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([54, "sfa", fld])
            });
    });

    test('remove_field', async () => {
        let edit = {peripheral:4, field:"field", action:"remove", value: {id:"sfa", object:"fld_id"}};
        let path = endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.edit;
        path = path.replace(":id", "54")
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([54, "sfa", "fld_id"])
            });
    });


    test('delete', async () => {
        let path = endpoints_map.peripheral.prefix + endpoints_map.peripheral.endpoints.delete;
        path = path.replace(":id", "54")
        return request(app.callback())
            .delete(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(54)
            });
    });

    afterAll(() => server.close());
});
