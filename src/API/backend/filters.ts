import database from "../../Database/Database";
import {spawnSync} from "node:child_process";
import {json} from "node:stream/consumers";

export default class FiltersBackend {
    public db: database;
    private designer_script: string;


    constructor(db: database) {
        this.db = db;
        this.designer_script = "/home/fils/git/uscope_server_js/scripts/filter_designer.py"
    }

    public async design_filter(id:number) {
        let filter = this.db.filters.get_filter(id);
        let raw_res = spawnSync("/usr/bin/python3", [this.designer_script, "design", JSON.stringify(filter)])
        let result = JSON.parse(String(raw_res.stdout));
        return { taps: result[0], response: result[1] };
    }

    public async implement_filter(id:number) {
        let filter = this.db.filters.get_filter(id);
        let raw_res = spawnSync("/usr/bin/python3", [this.designer_script, "implement", JSON.stringify(filter)])
        let y = String(raw_res.stderr);
        let x = String(raw_res.stdout);
        let result = JSON.parse(String(raw_res.stdout));
        return {taps:result[0], response:result[1]};
    }


}
