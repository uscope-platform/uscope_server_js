
interface rules_map {
    [index: string]: any;
    operations: {
        [index: string]: any;
        load_application:string,
        write_registers:string,
        read_register:string
        compile_program:string,
        apply_program:string
    }
    script: {
        [index: string]: any;
        hash:string,
        load_all:string,
        get:string,
        add:string,
        edit:string,
        delete:string
    },
    bitstream:{
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
        compile:string,
        apply:string
    },
    platform:{
        [index: string]: any;
        add_user:string,
        get_users:string,
        onboarding: string,
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
        delete: string,
        design:string,
        implement:string,
        get_response: string
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
        get:string,
        add:string,
        edit:string,
        delete:string
    }

}

let rules : rules_map = {
    operations:{
        load_application:"operator",
        read_register:"operator",
        write_registers:"operator",
        compile_program:"operator",
        apply_program:"operator"
    },
    script:{
        hash:'operator',
        load_all:'operator',
        get:'operator',
        add:'user',
        edit:'user',
        delete:'user'
    },
    bitstream:{
        hash:'operator',
        load_all:'operator',
        get:'admin',
        add:'admin',
        edit:'admin',
        delete:'admin'
    },
    program:{
        hash:'operator',
        load_all:'operator',
        get:'operator',
        add:'user',
        edit:'user',
        delete:'user',
        compile:"user",
        apply:"operator"
    },
    platform:{
        add_user:'admin',
        remove_user:'admin',
        get_users:'admin',
        onboarding: 'public',
        manual_login:'public',
        auto_login:'public'
    },
    peripheral:{
        hash:'operator',
        load_all:'operator',
        get:'operator',
        add:'admin',
        edit:'admin',
        delete:'admin'
    },
    filter:{
        hash:'operator',
        load_all:'operator',
        get:'operator',
        add:'user',
        edit:'user',
        delete:'user',
        implement:"user",
        design:"user",
        get_response:"user"
    },
    emulator:{
        hash:'operator',
        load_all:'operator',
        get:'user',
        add:'user',
        edit:'user',
        delete:'user',
        run:'user'
    },
    application:{
        hash:'operator',
        load_all:'operator',
        get:'operator',
        add:'admin',
        edit:'admin',
        delete:'admin'
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