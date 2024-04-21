import postgres from "postgres";


class peripherals_db {
    private db: postgres.Sql;

    constructor(d: postgres.Sql) {
        this.db = d;
    }
}

export default peripherals_db;