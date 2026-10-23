import { APP_PATH } from "@server/lib/consts";
import Database from "better-sqlite3";
import path from "path";

const version = "1.25.4";

export default async function migration() {
    console.log(`Running setup script ${version}...`);

    const location = path.join(APP_PATH, "db", "db.sqlite");
    const db = new Database(location);

    try {
        db.transaction(() => {
            db.prepare(
                `
                ALTER TABLE 'resources' ADD 'bindSessionToIp' integer DEFAULT false NOT NULL;
                `
            ).run();

            db.prepare(
                `
                ALTER TABLE 'resourceSessions' ADD 'ip' text;
                `
            ).run();
        })();

        console.log("Migrated database");
    } catch (e) {
        console.log("Failed to migrate db:", e);
        throw e;
    }

    console.log(`${version} migration complete`);
}
