import postgres from "postgres";


class emulators_db {
    private db: postgres.Sql;

    constructor(d: postgres.Sql) {
        this.db = d;
    }

}

export default emulators_db;