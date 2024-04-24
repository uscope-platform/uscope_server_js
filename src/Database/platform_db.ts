import postgres, {Row} from "postgres";
import {auto_login_object, user_model} from "../data_model/platform_model";


class platform_db {
    private db: postgres.Sql;

    constructor(d: postgres.Sql) {
        this.db = d;
    }


    public async get_user(username:string): Promise<user_model> {
        const res = await this.db<user_model[]>`
            select * from uscope.users where username = ${username}
        `
        return res[0];
    }

    public async add_user(username:string, pw_hash:string, role:string): Promise<any> {
        const res = await this.db`
            insert into uscope.users (username, pw_hash, role) values (${username}, ${pw_hash}, ${role})
        `
        return ;
    }

    public async remove_user(username:string): Promise<any> {
        const res = await this.db`
            delete from uscope.users where username = ${username}
        `
        return ;
    }

    public async add_auto_token(username:string, token: auto_login_object): Promise<any> {
        const res = await this.db`
            insert into uscope.login_tokens (username,selector, validator, expiry) values
                   (${username}, ${token.selector}, ${token.validator}, ${token.expiry})
        `
        return ;
    }

    public async get_auto_token(selector:string):Promise<Row[]> {
        return await this.db`
            select * from uscope.login_tokens where selector = ${selector}
        `
    }
}

export default platform_db;