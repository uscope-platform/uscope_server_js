import {database} from "#database";
import {expect} from "@jest/globals"
import postgres from "postgres";

describe('db_migration_test', () => {

    let db = new database("localhost", "uscope", "test", "test_migration_schema")

    let check_db = postgres({
        host: "localhost",
        port: 5432,
        database: "uscope",
        username: "uscope",
        password: "test"
    });

    const columns = async (table: string): Promise<string[]> => {
        let res = await check_db`
            SELECT column_name FROM information_schema.columns WHERE table_schema = 'test_migration_schema' AND table_name = ${table};
        `
        return res.map((val) => val.column_name).sort();
    }

    test('migrate_old_schema', async () => {
        await db.init_db();
        const expected_applications = await columns("applications");
        const expected_emulators = await columns("emulators");

        // bring the schema back to an old shape
        await check_db`alter table test_migration_schema.applications drop column pl_clocks`;
        await check_db`alter table test_migration_schema.applications add column legacy_column text`;
        await check_db`alter table test_migration_schema.emulators drop column layout`;
        await check_db`drop table test_migration_schema.filters`;
        await check_db`
            insert into test_migration_schema.applications (application_name) values ('kept')
        `

        await db.init_db();

        expect(await columns("applications")).toStrictEqual(expected_applications);
        expect(await columns("emulators")).toStrictEqual(expected_emulators);
        expect((await columns("filters")).length).toBeGreaterThan(0);

        let res = await check_db`select application_name, pl_clocks from test_migration_schema.applications`;
        expect(res.length).toBe(1);
        expect(res[0].application_name).toBe("kept");

        res = await check_db`select schema_name from information_schema.schemata where schema_name = 'test_migration_schema_migration_scratch'`;
        expect(res.length).toBe(0);
    });

    afterAll(async () => {
        await db.delete_database()
        await db.close();
        await check_db.end();
    })
});
