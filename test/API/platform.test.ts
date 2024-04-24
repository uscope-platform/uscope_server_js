
import request from "supertest"
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import platform_router from "../../src/API/frontend/platform_api";
import database from "../../src/Database/Database";
import {expect} from "@jest/globals";
import {json} from "node:stream/consumers";



describe('platform_tests', () => {


    const app = new Koa();

    app.use(bodyParser());

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
            get_user:(username:string)=>{
                return{
                    username: "test",
                    pw_hash: "$argon2id$v=19$m=32768,t=4,p=2$1m3bhIs18w/uuUCqW3ssOQ$EWndqvVWrX30DrVIxuM1HQuSdXq53DH9OM44zFC6oIDwAq4DGtMjvueiRyN6BU7EN/o",
                    role:"admin"
                }
            },
            add_auto_token:(user:string, token:object) =>{
                tokens = JSON.parse(JSON.stringify({user:user, token:token}));
            },
            get_auto_token:()=>{
                return[{
                    "selector": "eb966af6f07589f9e769e667d5d80d502f7fb509703a54ad9bf592ad6b4c68ca5b7b87b26a5282cad296a91236f275bfd8784a2c6837993061fa796fb68d2648",
                    "expiry": 1713987063865,
                    "validator": "14f1097418691f37690a06cb947bafee0f1912aa5f7e228e72f902e55da5af5a"
                }]
            }
        }
    } as any as database

    let rtr = new platform_router("secret", db)
    app.use(rtr.router.routes())

    app.listen(3000);

    test('add_user', async () => {
        let user_obj = {user:"test_user",password:"test", role:"admin"}
        return request(app.callback()).post('/platform/user').send(user_obj).then((response)=>{
            expect(response.status).toBe(200);
            expect(results.user).toBe("test_user");
            expect(results.pw_hash).not.toBeNull();
            expect(results.pw_hash.startsWith("$argon2id$v=19$m=32768,t=4,p=2")).toBeTruthy()
            expect(results.role).toBe("admin");
        });
    });

    test('remove_user', async () => {
        return request(app.callback()).delete('/platform/user/test_delete').then((response)=>{
            expect(response.status).toBe(200);
            expect(results.username).toBe("test_delete");
        });
    });


    test('success manual_login', async () => {
        let user_obj = {
            user: "test",
            password: "test",
            remember_me: false,
            login_type: "user"
        }

        return request(app.callback()).post('/platform/login/manual').send(user_obj).then((response)=>{
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

        return request(app.callback()).post('/platform/login/manual').send(user_obj).then((response)=>{
            expect(response.status).toBe(401);
            let result = response.body;
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

        return request(app.callback()).post('/platform/login/manual').send(user_obj).then((response)=>{
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
            expect(tokens.token.expiry).toBeLessThanOrEqual(Date.now() + 86400 * 30);
            expect(result.login_token.selector).toBe(tokens.token.selector)
            expect(result.login_token.expiry).toBe(tokens.token.expiry)
            expect(result.login_token.validator).not.toBeNull()


        });
    });

    test('auto_login', async () => {

        let user_obj = {
            "selector": "eb966af6f07589f9e769e667d5d80d502f7fb509703a54ad9bf592ad6b4c68ca5b7b87b26a5282cad296a91236f275bfd8784a2c6837993061fa796fb68d2648",
            "expiry": 1713987063865,
            "validator": "d8f411f4a88f6e862bde1b8419572a15a1de506e058c4c1ba53800ee7469b29ad698ce4ea35f035da768e6f2964ecdb57583e7aad6a16fcec2f9f65554d9733d",
            login_type: "automated"
        }
        return request(app.callback()).post('/platform/login/auto').send(user_obj).then((response)=>{
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

});
