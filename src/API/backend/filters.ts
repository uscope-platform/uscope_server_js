import {database} from "../../Database";
import {spawnSync} from "node:child_process";
import hw_interface from "../../hardware_interface/hw_interface";


let filter_designer =`
# Copyright 2021 University of Nottingham Ningbo China
# Author: Filippo Savi <filssavi@gmail.com>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import numpy as np
from scipy import signal
import sys
import json


def get_response_obj(ideal_taps, quant_taps, fs, taps_width):
    ret = dict()
    ideal_response = get_plot_data(ideal_taps, fs)
    ret["ideal"] = dict()
    ret["ideal"]["frequency"] = ideal_response[0]
    ret["ideal"]["response"] = ideal_response[1]
    q_data = np.array(quant_taps) / (2 ** taps_width)
    q_response = get_plot_data(q_data, fs)
    ret["quantized"] = dict()
    ret["quantized"]["frequency"] = q_response[0]
    ret["quantized"]["response"] = q_response[1]
    return ret


def get_plot_data(taps: np.ndarray, fs: float):
    plot_data = signal.freqz(taps, [1], worN=2000, fs=fs)
    freq = np.squeeze(plot_data[0]).tolist()

    resp_lin = np.abs(plot_data[1])
    resp_lin_clean = resp_lin
    for idx, val in enumerate(resp_lin):
        if val < 0:
            resp_lin_clean[idx] = resp_lin[idx - 1]
    resp_db = 20 * np.log10(resp_lin)
    resp = resp_db.tolist()
    return freq, resp


def design_filter(filter_parameters: dict):
    if filter_parameters["type"] == "lp":
        taps = design_lp(filter_parameters)
    elif filter_parameters["type"] == "hp":
        taps = design_hp(filter_parameters)
    elif filter_parameters["type"] == "bp":
        taps = design_bp(filter_parameters)
    elif filter_parameters["type"] == "bs":
        taps = design_bs(filter_parameters)
    else:
        raise ValueError("Unknown filter type")

    freq, resp = get_plot_data(taps, filter_parameters["sampling_frequency"])
    taps = taps.tolist()
    return taps, {"frequency": freq, "response": resp}


def implement_filter(taps: list, n_bits: int, fs: float):
    np_taps = np.array(taps)
    scaled_taps = np_taps * 2 ** n_bits
    np_taps_q = np.round(scaled_taps, 0)
    np_taps = np_taps_q / 2 ** n_bits
    plot_data = signal.freqz(np_taps, [1], worN=2000, fs=fs)
    freq = np.squeeze(plot_data[0]).tolist()

    resp_lin = np.abs(plot_data[1])
    resp_lin_clean = resp_lin
    for idx, val in enumerate(resp_lin):
        if val < 0:
            resp_lin_clean[idx] = resp_lin[idx - 1]
    resp_db = 20 * np.log10(resp_lin_clean, where=resp_lin > 0)
    resp = resp_db.tolist()
    return np_taps_q.tolist(), {"frequency": freq, "response": resp}


def design_lp(filter_parameters: dict):
    fs = filter_parameters["sampling_frequency"]
    pass_band = filter_parameters["pass_band_edge_1"]
    stop_band = filter_parameters["stop_band_edge_1"]

    n_taps = filter_parameters["n_taps"] + 1
    bands = [0, pass_band, stop_band, 0.5 * fs]
    desired = [1, 1, 0, 0]
    return signal.firls(n_taps, bands, desired, fs=fs)


def design_hp(filter_parameters: dict):
    fs = filter_parameters["sampling_frequency"]
    pass_band = filter_parameters["stop_band_edge_1"]
    stop_band = filter_parameters["pass_band_edge_1"]

    n_taps = filter_parameters["n_taps"] + 1
    bands = [0, stop_band, pass_band, 0.5 * fs]
    desired = [0, 0, 1, 1]
    return signal.firls(n_taps, bands, desired, fs=fs)


def design_bp(filter_parameters: dict):
    fs = filter_parameters["sampling_frequency"]
    pass_band_1 = filter_parameters["pass_band_edge_1"]
    stop_band_1 = filter_parameters["stop_band_edge_1"]

    pass_band_2 = filter_parameters["pass_band_edge_2"]
    stop_band_2 = filter_parameters["stop_band_edge_2"]

    n_taps = filter_parameters["n_taps"] + 1
    bands = [0, stop_band_1, pass_band_1, pass_band_2, stop_band_2, 0.5 * fs]
    desired = [0, 0, 1, 1, 0, 0]
    return signal.firls(n_taps, bands, desired, fs=fs)


def design_bs(filter_parameters: dict):
    fs = filter_parameters["sampling_frequency"]
    pass_band_1 = filter_parameters["pass_band_edge_1"]
    stop_band_1 = filter_parameters["stop_band_edge_1"]

    pass_band_2 = filter_parameters["pass_band_edge_2"]
    stop_band_2 = filter_parameters["stop_band_edge_2"]

    n_taps = filter_parameters["n_taps"] + 1
    bands = [0, pass_band_1, stop_band_1, stop_band_2, pass_band_2, 0.5 * fs]
    desired = [1, 1, 0, 0, 1, 1]

    return signal.firls(n_taps, bands, desired, fs=fs)


if __name__ == '__main__':
    flt_obj = json.loads(sys.argv[2])
    if sys.argv[1] == "design":
        print(json.dumps(design_filter(flt_obj['parameters'])))
    elif sys.argv[1] == "implement":
        filter = implement_filter(flt_obj['ideal_taps'], flt_obj["parameters"]["taps_width"], flt_obj["parameters"]["sampling_frequency"])
        print(json.dumps(filter))
    elif sys.argv[1] == "get_response":
        response = get_response_obj(flt_obj['ideal_taps'], flt_obj['quantized_taps'], flt_obj["parameters"]['sampling_frequency'], flt_obj["parameters"]["taps_width"])
        print(json.dumps(response))
`

export class FiltersBackend {
    public db: database;
    public hw_if: hw_interface;


    constructor(db: database, hw:hw_interface) {
        this.db = db;
        this.hw_if = hw;
    }

    public async design_filter(id:number) {
        let filter = await this.db.filters.get_filter(id);
        let raw_res = spawnSync("/usr/bin/python3", ['-c', filter_designer, "design", JSON.stringify(filter)])
        let result = JSON.parse(String(raw_res.stdout));
        await this.db.filters.update_filter_field(id, "ideal_taps", result[0]);
        return result[1]
    }

    public async implement_filter(id:number) {
        let filter = await this.db.filters.get_filter(id);
        let raw_res = spawnSync("/usr/bin/python3", ['-c', filter_designer,  "implement", JSON.stringify(filter)])
        let result = JSON.parse(String(raw_res.stdout));
        await this.db.filters.update_filter_field(id, "quantized_taps", result[0]);
        return result[1];
    }

    public async get_response(id:number) {
        let filter = await this.db.filters.get_filter(id);
        let raw_res = spawnSync("/usr/bin/python3", ['-c', filter_designer,  "get_response", JSON.stringify(filter)])
        return JSON.parse(String(raw_res.stdout));
    }


    public async apply_filter(id:number, addr:number){
        let filter =await this.db.filters.get_filter(id);
        if(filter.ideal_taps.length !==0){
         return this.hw_if.apply_filter(filter.quantized_taps, addr);
        }
    }
}


