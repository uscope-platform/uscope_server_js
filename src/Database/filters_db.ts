import postgres from "postgres";


class filters_db {
    private db: postgres.Sql;

    constructor(d: postgres.Sql) {
        this.db = d;
    }

}

export default filters_db;