
interface api_map {
    [index: string]: any;
    operations: {
        prefix:string,
        endpoints:{
            load_application:string,
            write_registers:string,
            read_register:string,
            compile_program:string,
            apply_program:string,
            clock:string,
            fetch_data:string,
            set_channel_status:string,
            scaling_factors:string,
            acquisition:string,
            scope_address:string,
            dma_disable:string,
            hil_deploy:string,
            hil_select_output:string,
            hil_set_input:string,
            hil_start:string,
            hil_stop:string
        }
    },
    settings:{
        prefix: string,
        endpoints:{
            [index: string]: any;
            debug_level:string,
            hil_address_map:string
        }
    },
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
            auto_login:string,
            db_dump:string,
            db_restore:string,
            versions:string
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
    settings:{
        prefix:"/settings",
        endpoints:{
            debug_level:'/debug_level',
            hil_address_map:'/hil_address_map',
        }
    },
    operations: {
        prefix:"/operations",
        endpoints:{
            load_application:"/load_application/:id",
            write_registers:"/write_registers",
            read_register:"/read_register/:address",
            compile_program:"/compile_program",
            apply_program:"/apply_program/:id",
            clock: "/clock",

            fetch_data:'/plot/data',
            set_channel_status: '/plot/channel_status',
            scaling_factors: '/plot/channel_scaling',
            acquisition: '/plot/acquisition',
            scope_address:'/plot/address',
            dma_disable:'/plot/dma_disable',

            hil_deploy: '/hil/deploy',
            hil_select_output: '/hil/select_out',
            hil_set_input: '/hil/set_input',
            hil_start:'/hil/start',
            hil_stop:'/hil/stop'
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
            onboarding: '/onboarding',
            db_dump: '/database/dump',
            db_restore: '/database/restore',
            versions: '/versions'
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