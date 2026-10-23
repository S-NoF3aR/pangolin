import { db } from "@server/db/pg/driver";
import { sql } from "drizzle-orm";

const version = "1.25.4";

export default async function migration() {
    console.log(`Running setup script ${version}...`);

    try {
        await db.execute(sql`BEGIN`);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "idpGrants" (
                "grantId" varchar PRIMARY KEY NOT NULL,
                "idpId" integer NOT NULL,
                "refreshToken" text NOT NULL,
                "validatedAt" bigint NOT NULL,
                "attemptedAt" bigint,
                "leaseId" varchar,
                "leaseExpiresAt" bigint,
                "revokedAt" bigint,
                CONSTRAINT "idpGrants_idpId_idp_idpId_fk" FOREIGN KEY ("idpId") REFERENCES "idp"("idpId") ON DELETE cascade
            );
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "sessionIdpGrants" (
                "sessionId" varchar PRIMARY KEY NOT NULL,
                "grantId" varchar NOT NULL,
                CONSTRAINT "sessionIdpGrants_sessionId_session_id_fk" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE cascade,
                CONSTRAINT "sessionIdpGrants_grantId_idpGrants_grantId_fk" FOREIGN KEY ("grantId") REFERENCES "idpGrants"("grantId") ON DELETE cascade
            );
        `);

        await db.execute(sql`
            ALTER TABLE "deviceWebAuthCodes" ADD COLUMN IF NOT EXISTS "approvingSessionId" varchar;
        `);

        await db.execute(sql`COMMIT`);
        console.log("Migrated database");
    } catch (e) {
        await db.execute(sql`ROLLBACK`);
        console.log("Unable to migrate database");
        console.log(e);
        throw e;
    }

    console.log(`${version} migration complete`);
}
