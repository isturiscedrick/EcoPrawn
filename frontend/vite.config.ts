import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";
for (const [key, value] of Object.entries(
  loadEnv(process.env.NODE_ENV || "development", process.cwd(), ""),
)) {
  if (process.env[key] === undefined) process.env[key] = value;
}
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro({ preset: "bun" }),
    react(),
  ],
});
