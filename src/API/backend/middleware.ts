import Koa from "koa";
import {endpoints_map} from "#api_frontend";
import  {roles_hierarchy} from "./authorization_rules";
import {rules} from ".";


// the status of the failures that do not say their own, kept as the routes always answered
const DEFAULT_ERROR_STATUS = 501;

/// An error with the status it must be answered with
export class http_error extends Error {
    public status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

/// The text of whatever was thrown: the routes and the database throw errors, strings and objects
const error_message = (err: any): string => {
    if(typeof err === "string") return err;
    if(err instanceof Error && err.message) return err.message;
    if(err !== null && typeof err === "object"){
        if(typeof err.message === "string" && err.message !== "") return err.message;
        try{
            const json = JSON.stringify(err);
            if(json !== undefined && json !== "{}") return json;
        } catch {}
    }
    return "Unknown error";
};

/// The one place where a failure becomes a response: {message} with the status of the error, so that the client
/// always gets the same shape, whatever was thrown
export let error_handler = async  (ctx:Koa.Context, next: Koa.Next) => {
    try {
        await next();
    } catch (err:any) {
        const status = typeof err?.status === "number" ? err.status : DEFAULT_ERROR_STATUS;
        ctx.status = status;
        const message = error_message(err);
        ctx.body = {message: message};
        if(status < 500 && typeof err?.status === "number"){
            // refused on purpose (bad request, no permission, ...): no stack to read
            console.warn(`${ctx.method} ${ctx.path} -> ${status}: ${message}`);
        } else {
            console.error(`${ctx.method} ${ctx.path} -> ${status}:`, err);
        }
    }
}


export function authorizer() {
    return async function (ctx:Koa.Context, next:Koa.Next) {
        let stripped_route = ctx.path.replace(endpoints_map.global_prefix, "");
        let [api_class, ...rest] = stripped_route.slice(1).split('/')
        let requested_endpoint = rest.join('/')
        if(!endpoints_map.hasOwnProperty(api_class)){
            ctx.status = 404;
            ctx.body = "unknown endpoint";
            return;
        }

        for(let item in endpoints_map[api_class].endpoints){
            let found_endpoint = endpoints_map[api_class].endpoints[item].slice(1);
            if(found_endpoint === requested_endpoint){
                let rule = rules[api_class][item];
                let required_role = roles_hierarchy[rule];
                if(required_role===99){
                    await next();
                    return;
                }
                if(!ctx.state.hasOwnProperty("user")){
                    ctx.status = 403;
                    ctx.body = "Authorization token missing";
                    return;
                }
                let user_role = roles_hierarchy[ctx.state.user.role];
                if(user_role <= required_role){
                    await next();
                    return;
                }
            }
        }

        // THE CHECK IS DONE IN TWO PASS TO HAVE PERFECT MATCHES OVERRIDE PARAMETRIZED ONES
        for(let item in endpoints_map[api_class].endpoints){
            let found_endpoint = endpoints_map[api_class].endpoints[item]
            let id_regex =/\/:[a-zA-Z0-9\-_]+$/;
            if(found_endpoint.match(id_regex)){
                let stripped_req_endpoint = requested_endpoint.split("/")[0];
                let stripped_found_endpoint = found_endpoint.replace(id_regex,"").slice(1);
                if(stripped_found_endpoint === stripped_req_endpoint || (stripped_found_endpoint=="" && !stripped_req_endpoint.includes("/"))){
                    let required_role = roles_hierarchy[rules[api_class][item]];
                    if(required_role===99){
                        await next();
                        return;
                    }
                    if(!ctx.state.hasOwnProperty("user")){
                        ctx.status = 403;
                        ctx.body = "Authorization token missing";
                        return;
                    }
                    let user_role = roles_hierarchy[ctx.state.user.role];
                    if(user_role <= required_role){
                        await next();
                        return;
                    }
                }
            }
        }
        
        ctx.status = 404;
        ctx.message = "unknown API";
    };
}
