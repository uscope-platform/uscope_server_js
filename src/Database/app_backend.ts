import postgres from "postgres";

class app_backend {
    private db: postgres.Sql;

    constructor(d: postgres.Sql) {
        this.db = d;
    }

}

export default app_backend;