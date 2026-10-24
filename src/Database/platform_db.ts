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

    /// Changes the name, the password hash and the role of a user, the ones that are given. The sessions and the tokens
    /// of the user follow its new name
    public async update_user(username:string, changes: {username?: string, pw_hash?: string, role?: string}): Promise<void> {
        await this.db.begin(async (tx) => {
            if(changes.pw_hash !== undefined){
                await tx`update ${tx(this.schema)}.users set pw_hash = ${changes.pw_hash} where username = ${username}`;
            }
            if(changes.role !== undefined){
                await tx`update ${tx(this.schema)}.users set role = ${changes.role} where username = ${username}`;
            }
            if(changes.username !== undefined && changes.username !== username){
                await tx`update ${tx(this.schema)}.users set username = ${changes.username} where username = ${username}`;
            }
        });
    }

    public async count_admins(): Promise<number> {
        const res = await this.db`
            select count(*)::int as count from ${this.db(this.schema)}.users where role = 'admin'
        `
        return res[0]?.count ?? 0;
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
