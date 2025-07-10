
interface api_map {
    [index: string]: any;
    global_prefix:string,
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
            hil_debug:string,
            hil_deploy:string,
            hil_hardware_sim:string,
            hil_disassemble:string,
            hil_emulate:string,
            hil_select_output:string,
            hil_set_input:string,
            hil_start:string,
            hil_stop:string,
            filter_design:string,
            filter_implement:string,
            filter_response:string,
            filter_apply:string
        }
    },
    settings:{
        prefix: string,
        endpoints:{
            [index: string]: any;
            debug_level:string,
            hil_address_map:string
            debugger_option:string
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
            delete:string
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
            delete: string
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
let g_prefix = "/uscope"

export let endpoints_map : api_map = {
    global_prefix:g_prefix,
    script:{
        prefix: g_prefix + "/script",
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
        prefix: g_prefix + "/settings",
        endpoints:{
            debugger_option:'/debugger_option/:name',
            debug_level:'/debug_level',
            hil_address_map:'/hil_address_map',
        }
    },
    operations: {
        prefix: g_prefix + "/operations",
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

            hil_debug: '/hil/debug',
            hil_deploy: '/hil/deploy',
            hil_hardware_sim: '/hil/hardware_sim',
            hil_disassemble: '/hil/disassemble',
            hil_emulate: '/hil/emulate',
            hil_select_output: '/hil/select_out',
            hil_set_input: '/hil/set_input',
            hil_start:'/hil/start',
            hil_stop:'/hil/stop',
            filter_design:"/filter_design/:id",
            filter_response:"/filter_response/:id",
            filter_implement:"/filter_implement/:id",
            filter_apply:"/filter_apply",
        }
    },
    bitstream:{
        prefix: g_prefix + "/bitstream",
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
        prefix: g_prefix + "/program",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            get:"/:id",
            add:"/:id",
            edit:"/:id",
            delete:"/:id"
        }
    },
    platform:{
        prefix: g_prefix + "/platform",
        endpoints:{
            add_user:'/user',
            get_users:'/user',
            remove_user:'/user/:name',
            manual_login:'/login/manual',
            auto_login:'/login/auto',
            onboarding: '/onboarding',
            db_dump: '/database/dump',
            db_restore: '/database/restore',
            versions: '/versions/:component'
        }
    },

    peripheral:{
        prefix: g_prefix + "/peripheral",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            get:"/:id",
            add:"/",
            edit:"/:id",
            delete:"/:id"
        }
    },

    filter:{
        prefix: g_prefix + "/filter",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            get:"/:id",
            add:"/:id",
            edit:"/:id",
            delete:"/:id"
        }
    },

    emulator:{
        prefix: g_prefix + "/emulator",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            get:"/:id",
            add:"/:id",
            edit:"/:id",
            delete:"/:id"
        }
    },

    application:{
        prefix: g_prefix + "/application",
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