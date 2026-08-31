import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * There used to be a cmsWritePlugin here: a dev-server middleware that handled
 * POST /__cms_write by writing public/cms-data.json to disk. It existed
 * because there was no backend, which meant the CMS could only save while
 * someone ran `npm run dev` locally — saving from the deployed site failed by
 * design.
 *
 * Both are gone. Content lives in Supabase, and the CMS writes to it from
 * production like any other client.
 *
 * The @cloudflare/vite-plugin is also gone, and its absence is deliberate.
 * Once wrangler.jsonc gained a `main`, the plugin took over the output layout
 * and split the build into dist/client/ and dist/anok/ -- which silently
 * breaks `wrangler deploy` run from the project root (the shape Cloudflare
 * Workers Builds is configured to use) and publishes a generated .dev.vars as
 * a public asset. Without it, vite emits a flat dist/ of client assets and
 * wrangler bundles worker/index.ts itself at deploy time.
 *
 * The cost is that `npm run dev` no longer runs the Worker, so edge-rendered
 * meta tags are not exercised there. `npm run preview` builds and starts
 * `wrangler dev`, which does run it.
 */
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 3000,
  },
  base: "/",
});
