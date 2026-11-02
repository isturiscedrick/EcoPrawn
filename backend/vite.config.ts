import { defineConfig, loadEnv } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { fileURLToPath } from 'node:url';
export default defineConfig(({ mode }) => {
  const portArg = process.argv.indexOf('--port');
  process.env.PORT = portArg >= 0 ? process.argv[portArg + 1] : (process.env.PORT || '4000');
  const port = Number(process.env.PORT);
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(env)) if (key !== 'PORT' && process.env[key] === undefined) process.env[key] = value;
  return { resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }, plugins: [tanstackStart(), nitro({ preset: 'bun' }), react(), { name: 'api-port', enforce: 'post', config: () => ({ server: { port } }) }], server: { port: 4000 } };
});
