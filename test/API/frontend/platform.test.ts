
import request from "supertest"
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import {platform_router, endpoints_map} from "#api_frontend";
import {database} from "#database";
import {expect} from "@jest/globals";
import {authorizer, error_handler} from "#api_backend";
import jwt from "koa-jwt";
import {hw_interface} from "#hw";


describe('platform API tests', () => {


    const app = new Koa();

    app.use(bodyParser());

    let bearer_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQwNDQ4NjJ9.3FCjAmBgEUuAlFqL7goWpwuu0OH6ldyTA--BLjyzIOE";

    let results:any = {}
    let tokens:any = {}
    let db = {
        platform:{
            remove_user:(username:string) =>{
              results = {username:username}
            },
            add_user:(username:string, pw_hash:string, role:string) =>{
                results = {user:username, pw_hash:pw_hash, role:role};
            },
            get_user:()=>{
                return{
                    username: "test",
                    pw_hash: "$argon2id$v=19$m=32768,t=4,p=2$1m3bhIs18w/uuUCqW3ssOQ$EWndqvVWrX30DrVIxuM1HQuSdXq53DH9OM44zFC6oIDwAq4DGtMjvueiRyN6BU7EN/o",
                    role:"admin"
                }
            },
            load_all:():any[] =>{
                return[ {username:"admin", role:"admin"},{username:"user", role:"user"} ]
            },
            add_auto_token:(user:string, token:object) =>{
                tokens = JSON.parse(JSON.stringify({user:user, token:token}));
            },
            get_auto_token:()=>{
                return[{
                    "selector": "eb966af6f07589f9e769e667d5d80d502f7fb509703a54ad9bf592ad6b4c68ca5b7b87b26a5282cad296a91236f275bfd8784a2c6837993061fa796fb68d2648",
                    "expiry": 171658415100,
                    "validator": "14f1097418691f37690a06cb947bafee0f1912aa5f7e228e72f902e55da5af5a"
                }]
            },
            has_users:()=>{
                return false
            }
        }
    } as any as database

    let hw = {
        get_version(component: string) {
            return component + "_veasfdd";
        }
    } as any as hw_interface;

    // Error handling middleware
    app.use(error_handler);
    app.use(jwt({ secret: 'secret', passthrough: true }));
    app.use(authorizer())

    let rtr = new platform_router("secret", db, hw);
    app.use(rtr.router.routes())
    app.use(rtr.router.allowedMethods());

    let server = app.listen(3006);

    test('add_user', async () => {
        let user_obj = {user:"test_user",password:"test", role:"admin"}
        return request(app.callback())
            .post(endpoints_map.platform.prefix + endpoints_map.platform.endpoints.add_user)
            .set('Authorization', `Bearer ${bearer_token}`)
            .send(user_obj)
            .then((response)=>{
            expect(response.status).toBe(200);
            expect(results.user).toBe("test_user");
            expect(results.pw_hash).not.toBeNull();
            expect(results.pw_hash.startsWith("$argon2id$v=19$m=32768,t=4,p=2")).toBeTruthy()
            expect(results.role).toBe("admin");
        });
    });

    test('remove_user', async () => {
        let path = endpoints_map.platform.prefix + endpoints_map.platform.endpoints.remove_user;
        path = path.replace(":name", "test_delete")
        return request(app.callback())
            .delete(path)
            .set('Authorization', `Bearer ${bearer_token}`)
            .then((response)=>{
            expect(response.status).toBe(200);
            expect(results.username).toBe("test_delete");
        });
    });

    test('load_all users', async () => {
        return request(app.callback())
            .get(endpoints_map.platform.prefix + endpoints_map.platform.endpoints.get_users)
            .set('Authorization', `Bearer ${bearer_token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual( [{username:"admin", role:"admin"}, {username:"user", role:"user"}]);
            });
    });

    test('onboarding_get', async () => {
        return request(app.callback())
            .get(endpoints_map.platform.prefix + endpoints_map.platform.endpoints.onboarding)
            .set('Authorization', `Bearer ${bearer_token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.body).toBeTruthy();
            });
    });


    test('onboarding_post', async () => {
        let user_obj = {user:"test_user2",password:"test2", role:"admin2"}
        return request(app.callback())
            .post(endpoints_map.platform.prefix + endpoints_map.platform.endpoints.onboarding)
            .set('Authorization', `Bearer ${bearer_token}`)
            .send(user_obj)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(results.user).toBe("test_user2");
                expect(results.pw_hash).not.toBeNull();
                expect(results.pw_hash.startsWith("$argon2id$v=19$m=32768,t=4,p=2")).toBeTruthy()
                expect(results.role).toBe("admin2");
            });
    });

    test('get_server_version', async () => {
        process.env.VERSION = "CAFEBEBE";
        let path = endpoints_map.platform.prefix + endpoints_map.platform.endpoints.versions;
        path = path.replace(":component", "server")
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${bearer_token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.text).toBe( "CAFEBEBE");
            });
    });

    test('get_driver_version', async () => {
        let path = endpoints_map.platform.prefix + endpoints_map.platform.endpoints.versions;
        path = path.replace(":component", "driver")
        return request(app.callback())
            .get(path)
            .set('Authorization', `Bearer ${bearer_token}`)
            .then((response)=>{
                expect(response.status).toBe(200);
                expect(response.text).toBe("driver_veasfdd");
            });
    });

    test('success manual_login', async () => {
        let user_obj = {
            user: "test",
            password: "test",
            remember_me: false,
            login_type: "user"
        }

        return request(app.callback()).post(endpoints_map.platform.prefix + endpoints_map.platform.endpoints.manual_login).send(user_obj).then((response)=>{
            expect(response.status).toBe(200);
            let result = response.body;
            expect(result.role).toBe("admin")
            expect(result.access_token).not.toBeNull()
            let token_content =  JSON.parse(Buffer.from(result.access_token.split('.')[1], 'base64').toString());
            expect(token_content.username).toBe("test")
            expect(token_content.role).toBe("admin")
        });
    });


    test('fail manual_login', async () => {
        let user_obj = {
            user: "test",
            password: "fail",
            remember_me: false,
            login_type: "user"
        }

        return request(app.callback())
            .post(endpoints_map.platform.prefix + endpoints_map.platform.endpoints.manual_login)
            .send(user_obj)
            .then((response)=>{
            expect(response.status).toBe(401);
            expect(response.text).toBe("Login failed");
        });
    });


    test('success manual_login remember', async () => {
        let user_obj = {
            user: "test",
            password: "test",
            remember_me: true,
            login_type: "user"
        }

        return request(app.callback())
            .post(endpoints_map.platform.prefix + endpoints_map.platform.endpoints.manual_login)
            .send(user_obj)
            .then((response)=>{
            expect(response.status).toBe(200);

            let result = response.body;
            expect(result.role).toBe("admin");
            expect(result.access_token).not.toBeNull();
            let token_content =  JSON.parse(Buffer.from(result.access_token.split('.')[1], 'base64').toString());
            expect(token_content.username).toBe("test");
            expect(token_content.role).toBe("admin");
            expect(tokens.user).toBe("test");
            expect(tokens.token.selector).not.toBeNull();
            expect(tokens.token.validator).not.toBeNull();
            let date = new Date();
            date.setDate(date.getDate() + 30);
            expect(Date.parse(tokens.token.expiry)).toBeLessThanOrEqual(date.getTime());
            expect(result.login_token.selector).toBe(tokens.token.selector)
            expect(result.login_token.expiry).toBe(tokens.token.expiry)
            expect(result.login_token.validator).not.toBeNull()


        });
    });

    test('auto_login', async () => {

        let user_obj = {
            "selector": "eb966af6f07589f9e769e667d5d80d502f7fb509703a54ad9bf592ad6b4c68ca5b7b87b26a5282cad296a91236f275bfd8784a2c6837993061fa796fb68d2648",
            "expiry": 171658415100,
            "validator": "d8f411f4a88f6e862bde1b8419572a15a1de506e058c4c1ba53800ee7469b29ad698ce4ea35f035da768e6f2964ecdb57583e7aad6a16fcec2f9f65554d9733d",
            login_type: "automated"
        }
        return request(app.callback())
            .post(endpoints_map.platform.prefix + endpoints_map.platform.endpoints.auto_login)
            .send(user_obj)
            .then((response)=>{
            expect(response.status).toBe(200);
            let result = response.body;
            expect(result.role).toBe("admin");
            expect(result.access_token).not.toBeNull();
            let token_content =  JSON.parse(Buffer.from(result.access_token.split('.')[1], 'base64').toString());
            expect(token_content.username).toBe("test");
            expect(token_content.role).toBe("admin");
            expect(token_content.iat).toBeLessThanOrEqual(Date.now());
        });
    });


    afterAll(() => server.close());
});
