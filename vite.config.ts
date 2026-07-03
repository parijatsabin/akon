import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { writeFileSync } from "fs";
import { resolve } from "path";
import type { Plugin } from "vite";

/**
 * cmsWritePlugin — handles POST /__cms_write in dev mode.
 * Receives the updated cms-data.json body and writes it to
 * public/cms-data.json on disk so changes persist across reloads.
 * This endpoint is never exposed in the production build.
 */
function cmsWritePlugin(): Plugin {
  return {
    name: "cms-write",
    configureServer(server) {
      server.middlewares.use("/__cms_write", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const body = Buffer.concat(chunks).toString("utf-8");

          // Validate it's real JSON before writing
          JSON.parse(body);

          const filePath = resolve(__dirname, "public/cms-data.json");
          writeFileSync(filePath, body, "utf-8");

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        } catch (err) {
          console.error("[CMS] Write failed:", err);
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: String(err) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    cloudflare(),
    cmsWritePlugin(),
  ],
  server: {
    port: 3000,
  },
  base: "/",
});
