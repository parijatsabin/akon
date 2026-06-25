/**
 * Validates environment configuration before running migrations.
 * Throws with a clear message listing every missing variable.
 */

type DbProvider = "supabase" | "postgres" | "mysql";

const REQUIRED: Record<DbProvider, string[]> = {
    supabase: [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
    ],
    postgres: [
        "POSTGRES_HOST",
        "POSTGRES_PORT",
        "POSTGRES_DB",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
    ],
    mysql: [
        "MYSQL_HOST",
        "MYSQL_PORT",
        "MYSQL_DB",
        "MYSQL_USER",
        "MYSQL_PASSWORD",
    ],
};

export function validateEnv(provider: DbProvider): void {
    const missing = REQUIRED[provider].filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables for provider "${provider}":\n` +
            missing.map((k) => `  • ${k}`).join("\n") +
            `\n\nCopy .env.example to .env and fill in the missing values.`
        );
    }
}

export function getProvider(): DbProvider {
    const raw = process.env.DB_PROVIDER?.toLowerCase();
    if (raw === "supabase" || raw === "postgres" || raw === "mysql") {
        return raw;
    }
    throw new Error(
        `DB_PROVIDER must be "supabase", "postgres", or "mysql". ` +
        `Got: "${raw ?? "(not set)"}"`
    );
}
