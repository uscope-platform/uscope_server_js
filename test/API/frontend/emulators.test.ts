import Koa from "koa";
import bodyParser from "koa-bodyparser";
import {database} from "#database";
import {authorizer, error_handler} from "#api_backend";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import {emulators_router, endpoints_map} from "#api_frontend";
import {
    connection_model,
    core_model,
    efi_implementation_type, emulator_edit_model,
    fcore_comparator_type
} from "#models";



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
                return "7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e";
            },
            load_all:() =>{
                return emulators;
            },
            get_emulator:(id:number) =>{
                return emulators[id-1];
            },
            add_core:(id:number, core:core_model)=>{
                results = ["add_core", id, core];
            },
            update_core:(id:number, core:core_model) =>{
                results = ["edit_core", id, core];
            },
            remove_core:(id:number, core:number) =>{
                results = ["remove_core", id, core];
            },
            add_connection:(id:number, conn:any) =>{
                results = ["add_connection", id, conn];
            },
            remove_connection:(id:number, src:any, dst:any) =>{
                results = ["remove_connection", id, src, dst];
            },
            add_dma_channel:(id:number, src:any, dst:any, obj:any)=>{

                results = ["add_channel", id, src, dst, obj];
            },
            edit_dma_channel:(id:number, src:any, dst:any,sel:any, obj:any)=>{

                results = ["edit_channel", id, src, dst,sel, obj];
            },
            remove_dma_channel:(id:number,name:any, src:any, dst:any)=>{

                results = ["remove_channel", id,name, src, dst];
            },
            add_emulator:(flt:any) =>{
                results = flt;
            },
            edit_atomic_field: (id:number, field_name: string, field_value:any) =>{
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
            .get(endpoints_map.emulator.prefix + endpoints_map.emulator.endpoints.hash)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.text).toBe("7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e")
            });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get(endpoints_map.emulator.prefix + endpoints_map.emulator.endpoints.load_all)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(emulators)
            });
    });

    test('get', async () => {
        let path = endpoints_map.emulator.prefix + endpoints_map.emulator.endpoints.get
        path = path.replace(':id', '1');
        return request(app.callback())
            .get(path)
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
        let path = endpoints_map.emulator.prefix + endpoints_map.emulator.endpoints.add
        path = path.replace(':id', '5');
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(filter_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(filter_obj)
            });
    });

    test('edit', async () => {
        let edit: emulator_edit_model = {id:4, field:"name", value:"tgag", action:"edit"};
        let path = endpoints_map.emulator.prefix + endpoints_map.emulator.endpoints.edit
        path = path.replace(':id', '4');
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([4, "name", "tgag"])
            });
    });

    test('delete', async () => {
        let path = endpoints_map.emulator.prefix + endpoints_map.emulator.endpoints.delete
        path = path.replace(':id', '4');
        return request(app.callback())
            .delete(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(4)
            });
    });


    test('add core', async () => {

        let core :core_model= {
            name: "test_core",
            id: 4,
            order:0,
            program:"test_program",
            channels:1,
            inputs:[],
            input_data:[],
            outputs:[],
            memory_init:[],
            options:{
                comparators:fcore_comparator_type.reducing_comparator,
                efi_implementation:efi_implementation_type.efi_none
            },
            sampling_frequency:0,
            deployment:{
                rom_address:0,
                control_address:0,
                has_reciprocal:false
            }
        }
        let edit = {emulator:4, field:"cores", action:"add", value:core};
        let path = endpoints_map.emulator.prefix + endpoints_map.emulator.endpoints.edit
        path = path.replace(':id', '4');
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(["add_core", 4, core])
            });
    });

    test('edit core', async () => {
        let core = {
            name: "test_core2",
            id: 4,
            order:0,
            program:"test_program",
            channels:1,
            inputs:[],
            input_data:[],
            outputs:[],
            memory_init:[],
            options:{
                comparators:fcore_comparator_type.reducing_comparator,
                efi_implementation:efi_implementation_type.efi_none
            },
            sampling_frequency:0,
            deployment:{
                rom_address:0,
                control_address:0,
                has_reciprocal:false
            }
        }
        let edit = {emulator:4, field:"cores", action:"edit", value:core};
        let path = endpoints_map.emulator.prefix + endpoints_map.emulator.endpoints.edit
        path = path.replace(':id', '4');
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(["edit_core", 4, core])
            });
    });

    test('remove core', async () => {
        let edit = {emulator:4, field:"cores", action:"remove", value:6};
        let path = endpoints_map.emulator.prefix + endpoints_map.emulator.endpoints.edit
        path = path.replace(':id', '4');
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(["remove_core", 4, 6])
            });
    });


    test('add connection', async () => {
        let conn :connection_model= {
            source:"test_src.a",
            destination:"test_dst.b"
        }
        let edit = {emulator:4, field:"connections", action:"add", value:conn};
        let path = endpoints_map.emulator.prefix + endpoints_map.emulator.endpoints.edit
        path = path.replace(':id', '4');
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(["add_connection", 4, conn])
            });
    });


    test('remove connection', async () => {
        let conn = {
            source:"test_src",
            destination:"test_dst",
        }
        let edit = {emulator:4, field:"connections", action:"remove", value:conn};
        let path = endpoints_map.emulator.prefix + endpoints_map.emulator.endpoints.edit
        path = path.replace(':id', '4');
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(["remove_connection", 4, "test_src", "test_dst"])
            });
    });

    afterAll(() => server.close());
});

