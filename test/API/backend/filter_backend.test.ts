import {expect} from "@jest/globals";

import {FiltersBackend} from "#api_backend";
import {database} from "#database";
import {hw_interface} from "#hw";


describe('filters backend test', () => {

    let update_val = {} as any;
    let db = {
        filters:{
            update_filter_field:(id:number, n:string, val:any)=>{
                update_val = {
                    id:id,
                    name:n,
                    value:val
                }
            },
            get_filter:(id:number) =>{
                if(id === 1) {
                    return {
                        id: 1,
                        name: "Filter 1",
                        parameters: {
                            type: "lp",
                            n_taps: 4,
                            taps_width: 16,
                            pass_band_edge_1: 5000,
                            pass_band_edge_2: 0,
                            stop_band_edge_1: 10000,
                            stop_band_edge_2: 0,
                            sampling_frequency: 50000
                        },
                        ideal_taps: [],
                        quantized_taps: []
                    }
                }else if(id === 2){
                    return  {
                        id:1,
                        name: "Filter 1",
                        parameters: {
                            type: "lp",
                            n_taps: 4,
                            taps_width: 16,
                            pass_band_edge_1: 5000,
                            pass_band_edge_2: 0,
                            stop_band_edge_1: 10000,
                            stop_band_edge_2: 0,
                            sampling_frequency: 50000
                        },
                        ideal_taps: [0.1320554217647556,
                            0.2517104915798938,
                            0.30367756571690047,
                            0.2517104915798938,
                            0.1320554217647556],
                        quantized_taps: []
                    }
                } else {
                    return  {
                        id:1,
                        name: "Filter 1",
                        parameters: {
                            type: "lp",
                            n_taps: 4,
                            taps_width: 16,
                            pass_band_edge_1: 5000,
                            pass_band_edge_2: 0,
                            stop_band_edge_1: 10000,
                            stop_band_edge_2: 0,
                            sampling_frequency: 50000
                        },
                        ideal_taps: [0.1320554217647556,
                            0.2517104915798938,
                            0.30367756571690047,
                            0.2517104915798938,
                            0.1320554217647556],
                        quantized_taps: [
                            8654,
                            16496,
                            19902,
                            16496,
                            8654]
                    }
                }

            },
        }
    } as any as database

    let backend = new FiltersBackend(db, {} as hw_interface);


    test('design_lp', async () => {
       let res =await backend.design_filter(1);
        expect(update_val.id).toStrictEqual(1);
        expect(update_val.name).toStrictEqual('ideal_taps');
        expect(update_val.value).toStrictEqual([0.1320554217647556,
            0.2517104915798938,
            0.30367756571690047,
            0.2517104915798938,
            0.1320554217647556]);
        expect(res.frequency).toHaveLength(2000);
        expect(res.response).toHaveLength(2000);
    });

    test('implement_lp', async () => {

        let res =await backend.implement_filter(2);

        expect(update_val.id).toStrictEqual(2);
        expect(update_val.name).toStrictEqual('quantized_taps');
        expect(update_val.value).toStrictEqual([
            8654,
            16496,
            19902,
            16496,
            8654]);
        expect(res.frequency).toHaveLength(2000);
        expect(res.response).toHaveLength(2000);
    });

    test('get_response', async () => {

        let res =await backend.get_response(3);

        expect(res.ideal.frequency).toHaveLength(2000);
        expect(res.ideal.frequency).toHaveLength(2000);
        expect(res.quantized.frequency).toHaveLength(2000);
        expect(res.quantized.frequency).toHaveLength(2000);
    });

    test('design_unknown_filter', async () => {
        let missing = new FiltersBackend({filters: {get_filter: () => undefined}} as any as database, {} as hw_interface);
        await expect(missing.design_filter(9)).rejects.toThrow("Filter 9 not found");
    });

    test('design_failure_reports_the_reason', async () => {
        let broken = new FiltersBackend({filters: {get_filter: () => ({id: 1, parameters: {type: "nonexistent"}})}} as any as database, {} as hw_interface);
        // the reason is the exception of the script: the unknown type, or the missing module when numpy is not installed
        await expect(broken.design_filter(1)).rejects.toThrow(/^Filter design failed: \w*(Error|Exception)/);
    });

});
