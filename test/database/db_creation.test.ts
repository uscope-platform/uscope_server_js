import database from "../../src/Database/Database";


describe('db_creation_test', () => {
    let db = new database("localhost", "uscope", "test")

    test('create_db', () => {
        return db.init_db("test_schema").then(()=>{
            let i:number = 0;
        })
    });

});