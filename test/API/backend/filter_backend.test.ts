import FiltersBackend from "../../../src/API/backend/filters";
import database from "../../../src/Database/Database";
import {expect} from "@jest/globals";


describe('filters backend test', () => {
    let db = {
        filters:{

            get_filter:(id:number) =>{
                if(id === 1){
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
                        ideal_taps: [],
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
                        quantized_taps: []
                    }
                }

            },
        }
    } as any as database
    let backend = new FiltersBackend(db);


    test('design_lp', async () => {
       let res =await backend.design_filter(1);
        expect(res.taps).toStrictEqual([0.1320554217647556,
            0.2517104915798938,
            0.30367756571690047,
            0.2517104915798938,
            0.1320554217647556]);
        expect(res.response.frequency).toHaveLength(2000);
        expect(res.response.response).toHaveLength(2000);
    });

    test('implement_lp', async () => {
        let res =await backend.implement_filter(2);
        expect(res.taps).toStrictEqual([
            8654,
            16496,
            19902,
            16496,
            8654]);
        expect(res.response.frequency).toHaveLength(2000);
        expect(res.response.response).toHaveLength(2000);
    });
});
