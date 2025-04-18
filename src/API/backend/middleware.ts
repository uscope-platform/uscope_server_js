import Koa from "koa";
import {endpoints_map} from "#api_frontend";
import  {roles_hierarchy} from "./authorization_rules";
import {rules} from ".";


export let error_handler = async  (ctx:Koa.Context, next: Koa.Next) => {
    try {
        await next();
    } catch (err:any) {
        ctx.status = err.status || 500;
        ctx.body = err.message;
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
