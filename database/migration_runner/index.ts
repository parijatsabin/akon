#!/usr/bin/env node
/**
 * ============================================================
 * ANOK Unified Migration Manager
 * ============================================================
 * Usage (via npm scripts):
 *
 *   npm run migrate:supabase        — run all pending supabase migrations
 *   npm run migrate:postgres        — run all pending postgres migrations
 *   npm run migrate:mysql           — run all pending mysql migrations
 *   npm run migrate:up              — run for DB_PROVIDER in .env
 *   npm run migrate:down            — rollback last migration
 *   npm run migrate:status          — show applied/pending migrations
 *   npm run seed                    — run all seed files
 *   npm run db:reset                — rollback all + re-run all + seed
 *
 * Flags:
 *   --dry-run                       — print SQL but do not execute
 *   --provider=supabase|postgres|mysql
 *
 * ============================================================
 */

import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { sha256 } from "./utils/checksum.ts";
import { log } from "./utils/logger.ts";
import { validateEnv, getProvider } from "./utils/validator.ts";
import { SupabaseMigrationProvider } from "./providers/supabase.ts";

// ── Parse CLI args ────────────────────────────────────────────
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const command = args.find((a) => !a.startsWith("--")) ?? "up";
const providerArg = args.find((a) => a.startsWith("--provider="))
    ?.replace("--provider=", "") as "supabase" | "postgres" | "mysql" | undefined;

const MIGRATIONS_DIR = resolve(import.meta.dirname, "../migrations");
const SEEDS_DIR = resolve(import.meta.dirname, "../seeds");

// ── Provider factory ──────────────────────────────────────────
function getProviderInstance(provider: "supabase" | "postgres" | "mysql") {
    switch (provider) {
        case "supabase":
            return new SupabaseMigrationProvider();
        default:
            throw new Error(
                `Provider "${provider}" is defined but its runner is not yet implemented. ` +
                `Add it to database/migration_runner/providers/${provider}.ts`
            );
    }
}

// ── File helpers ──────────────────────────────────────────────
async function getSqlFiles(dir: string): Promise<string[]> {
    const files = await readdir(dir).catch(() => [] as string[]);
    return files
        .filter((f) => f.endsWith(".sql") && !f.startsWith("rollback_"))
        .sort(); // alphabetical = version order
}

async function readSql(filePath: string): Promise<string> {
    return readFile(filePath, "utf-8");
}

// ── Commands ──────────────────────────────────────────────────

async function runMigrationsUp(provider: "supabase" | "postgres" | "mysql") {
    log.header(`ANOK Migration Runner — ${provider.toUpperCase()} — UP`);
    if (isDryRun) log.warn("DRY RUN — no SQL will be executed");
    log.divider();

    validateEnv(provider);
    const db = getProviderInstance(provider);
    const dir = join(MIGRATIONS_DIR, provider);
    const files = await getSqlFiles(dir);
    const applied = provider === "supabase"
        ? await (db as SupabaseMigrationProvider).getAppliedMigrations()
        : [];
    const appliedSet = new Set(applied.map((r) => r.migration_name));

    let ran = 0;
    let skipped = 0;

    for (const file of files) {
        const migrationName = file.replace(".sql", "");
        const filePath = join(dir, file);
        const sql = await readSql(filePath);
        const checksum = await sha256(sql);

        // Already applied — verify checksum hasn't changed
        const existingRecord = applied.find((r) => r.migration_name === migrationName);
        if (appliedSet.has(migrationName)) {
            if (existingRecord && existingRecord.checksum !== checksum) {
                log.warn(`CHECKSUM MISMATCH: ${migrationName}`);
                log.dim(`  File has been modified after being applied. Skipping — review manually.`);
            } else {
                log.dim(`  SKIP  ${migrationName}`);
                skipped++;
            }
            continue;
        }

        log.info(`Running: ${migrationName}`);
        const start = Date.now();

        if (!isDryRun) {
            try {
                await (db as SupabaseMigrationProvider).executeSql(sql);
                const ms = Date.now() - start;
                await (db as SupabaseMigrationProvider).recordMigration({
                    migration_name: migrationName,
                    version: migrationName.split("_")[0],
                    database_provider: provider,
                    status: "success",
                    checksum,
                    execution_time_ms: ms,
                });
                log.success(`  Done  ${migrationName}  (${ms}ms)`);
                ran++;
            } catch (err) {
                log.error(`  FAILED: ${migrationName}`);
                log.error(`  ${(err as Error).message}`);
                process.exit(1);
            }
        } else {
            log.dim(`  [dry-run] Would execute ${sql.length} chars of SQL`);
            ran++;
        }
    }

    log.divider();
    log.success(`Migrations complete. Ran: ${ran}, Skipped: ${skipped}`);
}

async function showStatus(provider: "supabase" | "postgres" | "mysql") {
    log.header(`ANOK Migration Status — ${provider.toUpperCase()}`);
    log.divider();

    validateEnv(provider);
    const db = getProviderInstance(provider);
    const dir = join(MIGRATIONS_DIR, provider);
    const files = await getSqlFiles(dir);
    const applied = provider === "supabase"
        ? await (db as SupabaseMigrationProvider).getAppliedMigrations()
        : [];
    const appliedSet = new Set(applied.map((r) => r.migration_name));

    for (const file of files) {
        const name = file.replace(".sql", "");
        const done = appliedSet.has(name);
        const mark = done ? "✔" : "○";
        const color = done ? "\x1b[32m" : "\x1b[33m";
        console.log(`  ${color}${mark}\x1b[0m  ${name}`);
    }

    log.divider();
    log.info(`Applied: ${applied.length} / ${files.length} migrations`);
}

async function runSeeds(provider: "supabase" | "postgres" | "mysql") {
    log.header(`ANOK Seed Runner — ${provider.toUpperCase()}`);
    if (isDryRun) log.warn("DRY RUN — no SQL will be executed");
    log.divider();

    validateEnv(provider);
    const db = getProviderInstance(provider);
    const files = await getSqlFiles(SEEDS_DIR);

    for (const file of files) {
        const filePath = join(SEEDS_DIR, file);
        const sql = await readSql(filePath);
        log.info(`Seeding: ${file}`);
        if (!isDryRun) {
            try {
                await (db as SupabaseMigrationProvider).executeSql(sql);
                log.success(`  Done  ${file}`);
            } catch (err) {
                log.error(`  FAILED: ${file} — ${(err as Error).message}`);
                process.exit(1);
            }
        } else {
            log.dim(`  [dry-run] Would execute ${sql.length} chars of SQL`);
        }
    }
    log.divider();
    log.success("Seeding complete.");
}

async function rollbackDown(provider: "supabase" | "postgres" | "mysql") {
    log.header(`ANOK Migration Runner — ${provider.toUpperCase()} — DOWN`);
    const rollbackDir = join(MIGRATIONS_DIR, provider, "rollbacks");
    const files = await getSqlFiles(rollbackDir);

    if (files.length === 0) {
        log.warn("No rollback files found.");
        return;
    }

    // Roll back the last migration (sorted descending)
    const lastRollback = files.slice().reverse()[0];
    const filePath = join(rollbackDir, lastRollback);
    const sql = await readSql(filePath);

    log.info(`Rolling back: ${lastRollback}`);
    if (!isDryRun) {
        validateEnv(provider);
        const db = getProviderInstance(provider);
        await (db as SupabaseMigrationProvider).executeSql(sql);
        log.success(`Rolled back: ${lastRollback}`);
    } else {
        log.dim(`[dry-run] Would execute rollback SQL`);
    }
}

// ── Main entrypoint ───────────────────────────────────────────
async function main() {
    const provider = providerArg ?? getProvider();

    switch (command) {
        case "up":
        case "migrate:up":
            await runMigrationsUp(provider);
            break;
        case "down":
        case "migrate:down":
            await rollbackDown(provider);
            break;
        case "status":
        case "migrate:status":
            await showStatus(provider);
            break;
        case "seed":
            await runSeeds(provider);
            break;
        default:
            log.error(`Unknown command: "${command}"`);
            log.info("Valid commands: up, down, status, seed");
            process.exit(1);
    }
}

main().catch((err) => {
    log.error(err.message ?? String(err));
    process.exit(1);
});
