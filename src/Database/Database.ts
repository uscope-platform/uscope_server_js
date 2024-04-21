import postgres from "postgres";

import applications_db from "./applications_db";
import app_backend from "./app_backend";
import scripts_db from "./scripts_db";
import programs_db from "./programs_db";
import filters_db from "./filters_db";
import emulators_db from "./emulators_db";
import peripherals_db from "./peripherals_db";
import Applications_db from "./applications_db";

const sql = postgres({ max: 4 })

class database {
    public applications:object;
    public scripts: object;
    public programs: object;
    public filters: object;
    public emulators: object;
    public peripherals: object;
    public app_backend: object;

     constructor(host: string, username:string, password:string) {
         let sql = postgres('postgres://username:password@host:port/database', {
             host: host,
             port: 5432,
             database:"uscope",
             username: username,
             password:password
         })

         this.applications = new Applications_db(sql);
         this.app_backend = new app_backend(sql);
         this.scripts = new scripts_db(sql);
         this.programs = new programs_db(sql);
         this.filters = new filters_db(sql);
         this.emulators = new emulators_db(sql);
         this.peripherals = new peripherals_db(sql);

     }
}


export default database;