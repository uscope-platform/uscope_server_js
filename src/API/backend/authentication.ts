import database from "../../Database/Database";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {randomBytes, timingSafeEqual} from "node:crypto";
import {subtle} from "node:crypto";
import {auth_response, auto_login_object, user_login_object} from "../../data_model/platform_model";

class CustomError extends Error {
    public status:number;
    public message:string
    constructor(status:number, message:string) {
        super(message);
        this.message = message;
        this.status = status;
    }
}

export default class Authenticator {
    private readonly secret: string
    private db: database
    constructor(s:string, d: database) {
        this.secret = s;
        this.db = d;
    }



    public async authenticate(login:user_login_object|auto_login_object) {
        if(login.login_type == "automated"){
            return this.authenticate_auto(login)
        } else if(login.login_type == "user"){
            return this.authenticate_user(login)
        }
    }

    private async authenticate_user(login:user_login_object): Promise<auth_response|null>{
        let token = await this.authenticate_pw(login.user, login.password)
        if(token !== null){
            if(login.remember_me){
                let auto_token = <auto_login_object>{};
                auto_token.selector = randomBytes(64).toString('hex');
                let validator = randomBytes(64).toString('hex');
                let date = new Date();
                date.setDate(date.getDate() + 30);
                auto_token.expiry = date.toISOString();
                auto_token.validator = await this.validate_auto_token(validator)
                await this.db.platform.add_auto_token(login.user, auto_token)
                auto_token.validator = validator
                token.login_token = auto_token
            }
            return token
        } else {
            throw new CustomError(401, "Login failed")
        }
    }

    private async authenticate_auto(login:auto_login_object){

        let query_res = await this.db.platform.get_auto_token(login.selector)
        if(query_res.length>1 || query_res.length==0){
            throw new CustomError(401, "Login failed")
        } else {
            let token = <auto_login_object>query_res[0]
            if(Date.now()>=Date.parse(token.expiry)){
                throw new CustomError(401, "Login failed")
            }
            let hashed_validator =await this.validate_auto_token(login.validator)
            if(timingSafeEqual(Buffer.from(hashed_validator), Buffer.from(token.validator))){
                let user = await this.db.platform.get_user(query_res[0].username)
                let access_token =  this.generate_token(user.username, user.role);
                let ret = <auth_response>{}
                ret.access_token = access_token
                ret.role = user.role
                return ret
            }

        }
    }

    private async authenticate_pw(username:string, password:string):Promise<auth_response|null>{
        let user = await this.db.platform.get_user(username);
        if (await argon2.verify(user.pw_hash, password)) {
            let ret = <auth_response>{};
            ret.access_token = this.generate_token(username, user.role);
            ret.role = user.role;
            return ret;
        } else {
            throw new CustomError(401, "Login failed")
        }
    }

    private generate_token(user:string, role:string){
        return jwt.sign({username:user, role:role}, this.secret)
    }

    public async create_user(username:string, password:string, role:string){
        let pw_hash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 15,
            parallelism: 2,
            timeCost: 4,
            hashLength: 50
        })
        await this.db.platform.add_user(username, pw_hash, role)
        return
    }

    public async remove_user(username:string){
        await this.db.platform.remove_user(username);
    }

    private async validate_auto_token(token:string): Promise<string>{

        const uint_validator = new TextEncoder().encode(token);
        let processed_validator = await subtle.digest("SHA-256", uint_validator);
        return Array.prototype.map.call(new Uint8Array(processed_validator), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

}