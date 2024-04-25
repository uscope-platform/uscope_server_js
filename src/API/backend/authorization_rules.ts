
interface rules_map {
    [index: string]: any;
    script: {
        [index: string]: any;
        hash:string,
        load_all:string,
        get:string,
        add:string,
        edit:string,
        delete:string
    },
    program:{
        [index: string]: any;
        hash:string,
        load_all:string,
        get:string,
        add:string,
        edit:string,
        delete:string,
        compile:string
    },
    platform:{
        [index: string]: any;
        add_user:string,
        remove_user:string,
        manual_login:string,
        auto_login:string
    },
    peripheral:{
        [index: string]: any;
        hash: string,
        load_all: string,
        get: string,
        add: string,
        edit: string,
        delete: string
    },
    filter:{
        [index: string]: any;
        hash: string,
        load_all: string,
        get: string,
        add: string,
        edit: string,
        delete: string
    },
    emulator:{
        [index: string]: any;
        hash: string,
        load_all: string,
        get: string,
        add: string,
        edit: string,
        delete: string
        run:string
    },
    application:{
        [index: string]: any;
        hash:string,
        load_all:string,
        load_app:string,
        get:string,
        add:string,
        edit:string,
        delete:string
    }

}

let rules : rules_map = {
    script:{
        hash:"operator",
        load_all:"operator",
        get:"operator",
        add:"user",
        edit:"user",
        delete:"user"
    },
    program:{
        hash:"operator",
        load_all:"operator",
        get:"operator",
        add:"user",
        edit:"user",
        delete:"user",
        compile:"user"
    },
    platform:{
        add_user:'admin',
        remove_user:'admin',
        manual_login:'public',
        auto_login:'public'
    },
    peripheral:{
        hash:"operator",
        load_all:"operator",
        get:"operator",
        add:"admin",
        edit:"admin",
        delete:"admin"
    },
    filter:{
        hash:"operator",
        load_all:"operator",
        get:"operator",
        add:"user",
        edit:"user",
        delete:"user"
    },
    emulator:{
        hash:"operator",
        load_all:"operator",
        get:"operator",
        add:"user",
        edit:"user",
        delete:"user",
        run:"user"
    },
    application:{
        hash:"operator",
        load_all:"operator",
        load_app:"operator",
        get:"operator",
        add:"admin",
        edit:"admin",
        delete:"admin"
    }
}

interface  roles_hierarcy_t {
    [index: string]: number;
    admin: number,
    user:number,
    operator:number,
    public:number
}

export const roles_hierarchy: roles_hierarcy_t = {
    admin: 0,
    user:1,
    operator:2,
    public:99
}

export default rules