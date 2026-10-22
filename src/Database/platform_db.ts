import postgres, {Row} from "postgres";
import {auto_login_object, user_model} from "#models";


export class platform_db {
    private readonly db: postgres.Sql;
    private readonly schema: string;

    constructor(d: postgres.Sql, schema: string) {
        this.db = d;
        this.schema = schema;
    }

    public async close(): Promise<void>{
        await this.db.end();
    }

    public async get_user(username:string): Promise<user_model> {
        const res = await this.db<user_model[]>`
            select * from ${this.db(this.schema)}.users where username = ${username}
        `
        return res[0];
    }

    public async load_all(): Promise<any[]> {
        const res = await this.db<user_model[]>`
            select * from ${this.db(this.schema)}.users
        `
        return res.map((user:user_model)=>{
            return {username:user.username, role:user.role};
        });
    }

    public async add_user(username:string, pw_hash:string, role:string): Promise<any> {
        await this.db`
            insert into ${this.db(this.schema)}.users (username, pw_hash, role) values (${username}, ${pw_hash}, ${role})
        `
        return ;
    }

    /// Adds the user only when there is none: the check and the insert are one transaction under a lock on the table,
    /// so that of two requests at the same time only one gets in. False when there were users already
    public async add_first_user(username:string, pw_hash:string, role:string): Promise<boolean> {
        return this.db.begin(async (tx) => {
            await tx`lock table ${tx(this.schema)}.users in exclusive mode`;
            const res = await tx`select EXISTS(select 1 from ${tx(this.schema)}.users)`;
            if(res[0]?.exists) return false;
            await tx`
                insert into ${tx(this.schema)}.users (username, pw_hash, role) values (${username}, ${pw_hash}, ${role})
            `;
            return true;
        });
    }

    public async remove_user(username:string): Promise<any> {
        await this.db`
            delete from ${this.db(this.schema)}.users where username = ${username}
        `
        return ;
    }

    public async user_exists(username:string): Promise<boolean> {
        const res = await this.db`
            select EXISTS(select * from ${this.db(this.schema)}.users where username= ${username})
        `
        return res[0].exists;
    }
    public async add_auto_token(username:string, token: auto_login_object): Promise<any> {
        await this.db`
            insert into ${this.db(this.schema)}.login_tokens (username,selector, validator, expiry) values
                   (${username}, ${token.selector}, ${token.validator}, ${token.expiry})
        `
        return ;
    }

    public async get_auto_token(selector:string):Promise<Row[]> {
        return this.db`
            select * from ${this.db(this.schema)}.login_tokens where selector = ${selector}
        `;
    }

    public async has_users():Promise<boolean>{
        let res = await this.db`
            select EXISTS(select * from ${this.db(this.schema)}.users)
        `
        return res[0].exists;
    }
}
