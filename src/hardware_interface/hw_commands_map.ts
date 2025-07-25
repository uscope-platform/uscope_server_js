interface hw_commands_map {
        infrastructure: {
            null:string
        },
        control:{
            load_bitstream:string,
            register_write:string,
            register_read:string,
            apply_filter:string
        },
        scope:{
            read_data:string,
            set_scaling_factors:string,
            set_channel_status:string,
            disable_scope_dma:string,
            get_acquisition_status:string,
            set_acquisition:string,
            set_scope_address:string
        },
        core:{
            apply_program:string,
            deploy_hil:string,
            emulate_hil:string,
            compile_program:string,
            hil_disassemble:string,
            hil_select_out:string,
            hil_hardware_sim: string,
            hil_debug:string,
            hil_set_in:string,
            hil_start:string,
            hil_stop:string,
            set_hil_address_map:string,
            get_hil_address_map:string
        },
        platform:{
            set_pl_clock:string,
            get_clock:string,
            get_version:string,
            set_debug_level:string,
            get_debug_level:string,
            set_debugger_option:string,
            get_debugger_option:string
        }
}

export let commands :hw_commands_map = {
    infrastructure: {
        null:"null"
    },
    control:{
        load_bitstream:"load_bitstream",
        register_write:"register_write",
        register_read:"register_read",
        apply_filter:"apply_filter"
    },
    scope:{
        read_data:"read_data",
        set_scaling_factors:"set_scaling_factors",
        set_channel_status:"set_channel_status",
        disable_scope_dma:"disable_scope_dma",
        get_acquisition_status:"get_acquisition_status",
        set_acquisition:"set_acquisition",
        set_scope_address:"set_scope_address"
    },
    core:{
        apply_program:"apply_program",
        deploy_hil:"deploy_hil",
        emulate_hil:"emulate_hil",
        compile_program:"compile_program",
        hil_select_out:"hil_select_out",
        hil_disassemble:"hil_disassemble",
        hil_hardware_sim: "hil_hardware_sim",
        hil_set_in:"hil_set_in",
        hil_debug:"hil_debug",
        hil_start:"hil_start",
        hil_stop:"hil_stop",
        set_hil_address_map:"set_hil_address_map",
        get_hil_address_map:"get_hil_address_map"
    },
    platform:{
        set_pl_clock:"set_pl_clock",
        get_clock:"get_clock",
        get_version:"get_version",
        set_debug_level:"set_debug_level",
        get_debug_level:"get_debug_level",
        set_debugger_option: "set_debugger_option",
        get_debugger_option: "get_debugger_option"
    }
}