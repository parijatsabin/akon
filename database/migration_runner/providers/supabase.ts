/**
 * Supabase migration provider.
 * Uses the Supabase Management REST API to execute SQL directly,
 * or falls back to the Supabase JS client for query execution.
 *
 * For migration runs, we use the service_role key which bypasses RLS.
 * Never expose the service_role key in the browser or Worker client code.
 */

import { log } from "../utils/logger.ts";

export interface MigrationRecord {
    migration_name: string;
    version: string;
    database_provider: string;
    status: string;
    checksum: string;
}

export class SupabaseMigrationProvider {
    private url: string;
    private serviceRoleKey: string;

    constructor() {
        this.url = process.env.SUPABASE_URL!;
        this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    }

    /** Execute raw SQL via Supabase REST (pg endpoint) */
    async executeSql(sql: string): Promise<void> {
        const response = await fetch(`${this.url}/rest/v1/rpc/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.serviceRoleKey}`,
                "apikey": this.serviceRoleKey,
                "Prefer": "return=minimal",
            },
            body: JSON.stringify({ query: sql }),
        });

        // Supabase also supports direct SQL via the pg REST endpoint
        // For raw DDL we use the SQL editor endpoint
        const sqlEndpoint = `${this.url}/rest/v1/`;
        void sqlEndpoint; // used when switching to direct pg connection

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Supabase SQL error: ${response.status} — ${error}`);
        }
    }

    /** Record a successful migration in migration_history */
    async recordMigration(
        record: MigrationRecord & { execution_time_ms: number }
    ): Promise<void> {
        const response = await fetch(`${this.url}/rest/v1/migration_history`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.serviceRoleKey}`,
                "apikey": this.serviceRoleKey,
                "Prefer": "return=minimal",
            },
            body: JSON.stringify({ ...record, status: "success" }),
        });

        if (!response.ok) {
            const err = await response.text();
            log.warn(`Could not record migration history: ${err}`);
        }
    }

    /** Fetch list of already-applied migrations */
    async getAppliedMigrations(): Promise<MigrationRecord[]> {
        const response = await fetch(
            `${this.url}/rest/v1/migration_history?status=eq.success&database_provider=eq.supabase&select=migration_name,version,database_provider,status,checksum`,
            {
                headers: {
                    "Authorization": `Bearer ${this.serviceRoleKey}`,
                    "apikey": this.serviceRoleKey,
                },
            }
        );

        if (!response.ok) return [];
        return response.json() as Promise<MigrationRecord[]>;
    }

    /** Mark a migration as rolled back */
    async recordRollback(migrationName: string): Promise<void> {
        await fetch(
            `${this.url}/rest/v1/migration_history?migration_name=eq.${migrationName}&database_provider=eq.supabase`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.serviceRoleKey}`,
                    "apikey": this.serviceRoleKey,
                },
                body: JSON.stringify({
                    status: "rolled_back",
                    rolled_back_at: new Date().toISOString(),
                }),
            }
        );
    }
}
