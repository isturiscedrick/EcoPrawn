if (!process.versions.bun) throw new Error('Bun is required to start the server.');
const port = process.env.PORT || '4000';
try { process.loadEnvFile('.env'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
process.env.PORT = port;
await import('../.output/server/index.mjs');
