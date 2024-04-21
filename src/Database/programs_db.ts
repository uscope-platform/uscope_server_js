import postgres from "postgres";

class programs_db {
    private db: postgres.Sql;

    constructor(d: postgres.Sql) {
        this.db = d;
    }
}

export default programs_db;