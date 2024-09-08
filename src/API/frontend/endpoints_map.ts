
interface api_map {
    [index: string]: any;
    operations: {
        prefix:string,
        endpoints:{
            load_application:string,
            write_registers:string,
            read_register:string
        }
    }
    script: {
        prefix: string,
        endpoints:{
            [index: string]: any;
            hash:string,
            load_all:string,
            get:string,
            add:string,
            edit:string,
            delete:string
        }
    },
    bitstream:{
        prefix:string,
        endpoints:{
            [index: string]: any;
            hash:string,
            load_all:string,
            get:string,
            add:string,
            edit:string,
            delete:string
        }
    },
    program:{
        prefix:string,
        endpoints:{
            [index: string]: any;
            hash:string,
            load_all:string,
            get:string,
            add:string,
            edit:string,
            delete:string,
            compile:string,
            apply:string
        }

    },
    platform:{
        prefix:string,
        endpoints:{
            [index: string]: any;
            add_user:string,
            get_users:string,
            onboarding: string,
            remove_user:string,
            manual_login:string,
            auto_login:string
        }
    },
    peripheral:{
        prefix:string,
        endpoints:{
            [index: string]: any;
            hash: string,
            load_all: string,
            get: string,
            add: string,
            edit: string,
            delete: string
        }
    },
    filter:{
        prefix:string,
        endpoints:{
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
        }
    },
    emulator:{
        prefix:string,
        endpoints:{
            [index: string]: any;
            hash: string,
            load_all: string,
            get: string,
            add: string,
            edit: string,
            delete: string
            run:string
        }
    },
    application:{
        prefix:string,
        endpoints:{
            [index: string]: any;
            hash:string,
            load_all:string,
            get:string,
            add:string,
            edit:string,
            delete:string
        }
    }

}

let endpoints_map : api_map = {

    script:{
        prefix:"/script",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            get:"/:id",
            add:"/:id",
            edit:"/:id",
            delete:"/:id"
        }
    },
    operations: {
        prefix:"/operations",
        endpoints:{
            load_application:"/load_application/:id",
            write_registers:"/write_registers",
            read_register:"/read_register/:address"
        }
    },
    bitstream:{
        prefix:"/bitstream",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            get:"/:id",
            add:"/:id",
            edit:"/:id",
            delete:"/:id"
        }
    },

    program:{
        prefix:"/program",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            get:"/:id",
            add:"/:id",
            edit:"/:id",
            delete:"/:id",
            compile:"/compile",
            apply:"/apply"
        }
    },
    platform:{
        prefix:"/platform",
        endpoints:{
            add_user:'/user',
            get_users:'/user',
            remove_user:'/user/:name',
            manual_login:'/login/manual',
            auto_login:'/login/auto',
            onboarding: '/onboarding'
        }
    },

    peripheral:{
        prefix:"/peripheral",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            get:"/:id",
            add:"/:id",
            edit:"/:id",
            delete:"/:id"
        }
    },

    filter:{
        prefix:"/filter",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            get:"/:id",
            add:"/:id",
            edit:"/:id",
            delete:"/:id",
            design:"/design",
            implement:"/implement",
            get_response:"/response"
        }
    },

    emulator:{
        prefix:"/emulator",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            get:"/:id",
            add:"/:id",
            edit:"/:id",
            delete:"/:id",
            run:"/run"
        }
    },

    application:{
        prefix:"/application",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            get:"/:id",
            add:"/:id",
            edit:"/:id",
            delete:"/:id"
        }
    }
}
export default endpoints_map