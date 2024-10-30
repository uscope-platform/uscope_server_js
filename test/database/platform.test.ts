import database from "../../src/Database/Database";
import {auto_login_object, user_model} from "../../src/data_model/platform_model";



describe('platform_database_tests', () => {

    let users = [
        {
            username: "admin",
            pw_hash: "$argon2id$v=19$m=32768,t=4,p=2$1m3bhIs18w/uuUCqW3ssOQ$EWndqvVWrX30DrVIxuM1HQuSdXq53DH9OM44zFC6oIDwAq4DGtMjvueiRyN6BU7EN/o",
            role:"admin"
        },
        {
            username: "user",
            pw_hash: "$argon2id$v=19$m=32768,t=4,p=2$1m3bhIs18w/uuUCqW3ssOQ$EWndqvVWrX30DrVIxuM1HQuSdXq53DH9OM44zFC6oIDwAq4DGtMjvueiRyN6BU7EN/o",
            role:"user"
        }
    ]

    let db = new database("localhost", "uscope", "test", "test_schema")

    beforeAll(async () =>{await db.init_db()})

    test('has_users', async () => {
        let res = await db.platform.has_users();
        expect(res).toBeFalsy();
    });
    test('add_get_user',async  () => {
        await db.platform.add_user("admin", "admin_pw_hash", "admin");
        let res = await db.platform.get_user("admin");
        let ref : user_model = {
            username: "admin",
            pw_hash: "admin_pw_hash",
            role:"admin"
        };
        expect(res).toStrictEqual(ref)
    });

    test('add_get_token',async  () => {
        let token:auto_login_object = {
            selector: "eb966af6f07589f9e769e667d5d80d502f7fb509703a54ad9bf592ad6b4c68ca5b7b87b26a5282cad296a91236f275bfd8784a2c6837993061fa796fb68d2648",
            expiry: "Wed, 30 Oct 2024 14:41:30 GMT",
            validator: "14f1097418691f37690a06cb947bafee0f1912aa5f7e228e72f902e55da5af5a",
            login_type: "automated"
        };

        await db.platform.add_auto_token("admin", token);
        let res = await db.platform.get_auto_token(token.selector);
        expect(res[0].selector).toBe(token.selector);
        expect(res[0].validator).toBe(token.validator)
        let res_epoch =new Date(Date.parse(res[0].expiry))
        res_epoch.setHours(res_epoch.getHours() - res_epoch.getTimezoneOffset()/60)
        expect(res_epoch.toUTCString()).toBe(token.expiry);
    });



    test('load all user',async  () => {
        await db.platform.add_user("user", "user_pw_hash", "user");
        let res = await db.platform.load_all();

        expect(res).toStrictEqual([{username:"admin", role:"admin"}, {username:"user", role:"user"}]);
    });

    test('remove_user', async () => {
        await db.platform.remove_user("admin");
        let res = await db.platform.user_exists("admin");
        expect(res).toBeFalsy();
    });


    afterAll(async ()=> {
        await db.delete_database()
        db.close()
    })
});