import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cp, mkdtemp, symlink, rm, rmdir, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { setTimeout } from 'node:timers/promises';
import assert from 'node:assert/strict';

export async function productionApp(backendUrl) {
  assert.ok(process.versions.bun, 'Bun is required to run the test server.');
  const source = fileURLToPath(new URL('..', import.meta.url));
  const fixture = await mkdtemp(join(tmpdir(), 'ecoprawn-start-test-'));
  let app;
  async function close() {
    if (app && app.exitCode === null) { const exit = once(app, 'exit'); app.kill(); await exit; }
    assert.equal(await realpath(dirname(fixture)), await realpath(tmpdir()));
    assert.ok(basename(fixture).startsWith('ecoprawn-start-test-'));
    await rmdir(join(fixture, 'node_modules')).catch(e => { if (e.code !== 'ENOENT') throw e; });
    await rm(fixture, { recursive: true, force: true });
  }
  try {
    for (const entry of ['src', 'public', 'package.json', 'bunfig.toml', 'tsconfig.json', 'vite.config.ts']) {
      await cp(join(source, entry), join(fixture, entry), { recursive: true }).catch(e => {
        if (e.code !== 'ENOENT' || !['public', 'bunfig.toml'].includes(entry)) throw e;
      });
    }
    await symlink(join(source, 'node_modules'), join(fixture, 'node_modules'), 'junction');
    const env = { ...process.env, BACKEND_URL: backendUrl, NODE_ENV: 'production' };
    const build = spawn(process.execPath, ['--no-env-file', '--bun', join(source, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: fixture, env, timeout: 180000, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    build.stdout.on('data', c => output += c); build.stderr.on('data', c => output += c);
    const [code] = await once(build, 'exit');
    assert.equal(code, 0, output);
    const reservation = createServer(); reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening');
    const port = reservation.address().port; await new Promise(resolve => reservation.close(resolve));
    const origin = `http://127.0.0.1:${port}`;
    app = spawn(process.execPath, ['--no-env-file', '.output/server/index.mjs'], { cwd: fixture, env: { ...env, PORT: String(port), HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
    output = ''; app.stdout.on('data', c => output += c); app.stderr.on('data', c => output += c);
    for (let i = 0; i < 150; i++) {
      if (app.exitCode !== null) throw new Error(output);
      try { await fetch(origin + '/favicon.ico', { signal: AbortSignal.timeout(1000) }); return { origin, close }; } catch { await setTimeout(200); }
    }
    throw new Error('Production server did not start: ' + output);
  } catch (error) { await close(); throw error; }
}
