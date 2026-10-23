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
                CREATE TABLE IF NOT EXISTS 'idpGrants' (
                    'grantId' text PRIMARY KEY NOT NULL,
                    'idpId' integer NOT NULL,
                    'refreshToken' text NOT NULL,
                    'validatedAt' integer NOT NULL,
                    'attemptedAt' integer,
                    'leaseId' text,
                    'leaseExpiresAt' integer,
                    'revokedAt' integer,
                    FOREIGN KEY ('idpId') REFERENCES 'idp'('idpId') ON UPDATE no action ON DELETE cascade
                );
                `
            ).run();

            db.prepare(
                `
                CREATE TABLE IF NOT EXISTS 'sessionIdpGrants' (
                    'sessionId' text PRIMARY KEY NOT NULL,
                    'grantId' text NOT NULL,
                    FOREIGN KEY ('sessionId') REFERENCES 'session'('id') ON UPDATE no action ON DELETE cascade,
                    FOREIGN KEY ('grantId') REFERENCES 'idpGrants'('grantId') ON UPDATE no action ON DELETE cascade
                );
                `
            ).run();

            db.prepare(
                `
                ALTER TABLE 'deviceWebAuthCodes' ADD 'approvingSessionId' text;
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
