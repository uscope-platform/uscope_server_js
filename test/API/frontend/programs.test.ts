import Koa from "koa";
import bodyParser from "koa-bodyparser";
import {database} from "../../../src/Database";
import {authorizer, error_handler} from "../../../src/API/backend";
import request from "supertest";
import {expect} from "@jest/globals";
import jwt from "koa-jwt"
import {programs_router, endpoints_map} from "../../../src/API/frontend";



describe('programs API tests', () => {


    const app = new Koa();

    app.use(bodyParser());

    let programs: any = [
        {
            "id": 1,
            "name": "hil_dg",
            "content": "void main(){\n    float i_mem;\n\n    i_mem = i_mem + 10.0;\n    int i_mem = fti(i_mem);\n    i_mem = i_mem & 2047;\n  i_mem = itf(i_mem);\n}",
            "type": "C",
            "hex": ["262145", "12", "12", "38", "1092616192", "264257", "12"],
            "build_settings": {"io": {"inputs": [], "outputs": [], "memories": ["i_mem"]}},
            "cached_bin_version": "",
            "headers": []
        },
        {
            "id": 2,
            "name": "hil_dt",
            "content": "void main(){\n  float b_f = itf(b);\n  c = a/b_f;\n}",
            "type": "C",
            "hex": [],
            "build_settings": {"io": {"inputs": ["a", "b"], "outputs": ["c"],"memories": []}},
            "cached_bin_version": "",
            "headers": []
        }];

    let results:any = {}
    let db = {
        programs:{
            get_version: ():string =>{
                return "7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e"
            },
            load_all:() =>{
                return programs
            },
            get_program:(id:number) =>{
                return programs[id-1]
            },
            add_program:(scr:any) =>{
                results = scr;
            },
            update_program_field: (id:number, field_name: string, field_value:any) =>{
                results = [id, field_name, field_value];
            },
            remove_program:(id:number) =>{
                results = id;
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
            expect(response.status).toBe(200);
            expect(response.text).toBe("7fe0e405-4b6b-419a-a5f3-3b51fffa8e7e")
        });
    });

    test('load_all', async () => {
        return request(app.callback())
            .get(endpoints_map.program.prefix + endpoints_map.program.endpoints.load_all)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(programs)
            });
    });

    test('get', async () => {
        let path = endpoints_map.program.prefix + endpoints_map.program.endpoints.get;
        path = path.replace(":id", "1");
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(programs[0])
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
        path = path.replace(":id", "3");
        return request(app.callback())
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(program_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(program_obj)
            });
    });

    test('edit', async () => {
        let edit = {script:4, field:"content", value:"test_content"};
        let path = endpoints_map.program.prefix + endpoints_map.program.endpoints.edit;
        path = path.replace(":id", "4");
        return request(app.callback())
            .patch(path)
            .set('Authorization', `Bearer ${token}`)
            .send(edit)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual([4, "content", "test_content"])
            });
    });

    test('delete', async () => {
        let path = endpoints_map.program.prefix + endpoints_map.program.endpoints.delete;
        path = path.replace(":id", "3");
        return request(app.callback())
            .delete(path)
            .set('Authorization', `Bearer ${token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results).toStrictEqual(3)
            });
    });

    afterAll(() => server.close());
});
