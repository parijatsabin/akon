import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

/**
 * There used to be a cmsWritePlugin here: a dev-server middleware that handled
 * POST /__cms_write by writing public/cms-data.json to disk. It existed
 * because there was no backend, which meant the CMS could only save while
 * someone ran `npm run dev` locally — saving from the deployed site failed by
 * design.
 *
 * Both are gone. Content lives in Supabase, and the CMS writes to it from
 * production like any other client.
 */
export default defineConfig({
  plugins: [
    react(),
    cloudflare(),
  ],
  server: {
    port: 3000,
  },
  base: "/",
});
