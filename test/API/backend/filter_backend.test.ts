import FiltersBackend from "../../../src/API/backend/filters";
import database from "../../../src/Database/Database";
import {expect} from "@jest/globals";
import hw_interface from "../../../src/hardware_interface/hw_interface";


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

});
