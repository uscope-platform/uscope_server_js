
interface api_map {
    [index: string]: any;
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
            compile:string
        }

    },
    platform:{
        prefix:string,
        endpoints:{
            [index: string]: any;
            add_user:string,
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
            run:string
        }
    },
    application:{
        prefix:string,
        endpoints:{
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
            compile:"/compile"
        }
    },

    platform:{
        prefix:"/platform",
        endpoints:{
            add_user:'/user',
            remove_user:'/user/:name',
            manual_login:'/login/manual',
            auto_login:'/login/auto'
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
            delete:"/:id"
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
            run:""
        }
    },

    application:{
        prefix:"/application",
        endpoints:{
            hash:"/hash",
            load_all:"/load_all",
            load_app:"",
            get:"/:id",
            add:"/:id",
            edit:"/:id",
            delete:"/:id"
        }
    }
}

export default endpoints_map