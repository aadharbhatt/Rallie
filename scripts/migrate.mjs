import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** No remote/reset/seed operation exists in this foundation runner. Fail before spawning. */
export function migrationPlan(args) {
  const [action, ...options] = args;
  if (!['apply', 'status'].includes(action)) throw new Error('Only apply/status are supported; reset and seed are forbidden.');
  const values = {};
  for (let i = 0; i < options.length; i += 2) {
    const key = options[i];
    if (!['--env', '--persist-to'].includes(key) || !options[i + 1] || values[key]) throw new Error('Use --env dev|test and optional --persist-to .local/<directory>; no remote flags.');
    values[key] = options[i + 1];
  }
  const environment = values['--env'];
  if (!['dev', 'test'].includes(environment)) throw new Error('Explicit --env dev|test is required. Staging/production are not provisioned; refusing any write.');
  const persistence = resolve(root, values['--persist-to'] ?? `.local/state/${environment}`);
  const localPath = relative(resolve(root, '.local'), persistence);
  if (!localPath || localPath.startsWith('..') || isAbsolute(localPath)) throw new Error('Persistence must be a directory inside .local/; refusing an unsafe target.');
  const base = ['--config', resolve(root, 'wrangler.jsonc'), '--env', environment];
  const environmentFile = `--env-file=${resolve(root, 'config/local-vars.txt')}`;
  const command = (operation) => [...base, 'd1', 'migrations', operation, 'DB', '--local', '--persist-to', persistence, environmentFile];
  const versions = [...base, 'd1', 'execute', 'DB', '--local', '--persist-to', persistence, '--command', 'SELECT name, applied_at FROM d1_migrations ORDER BY id', environmentFile];
  return { environment, persistence, commands: action === 'apply' ? [command('apply'), command('list'), versions] : [command('list')] };
}

export function runMigrations(args, execute = spawnSync) {
  const plan = migrationPlan(args);
  console.log(`D1 migrations: ${plan.environment}, local emulator only. Pending-version report follows.`);
  for (const args of plan.commands) {
    const result = execute(process.execPath, [resolve(root, 'node_modules/wrangler/bin/wrangler.js'), ...args], {
      cwd: root, stdio: 'inherit', env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' },
    });
    if (result.error || result.status !== 0) throw new Error('Local migration command failed. No remote fallback was attempted.');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { runMigrations(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}