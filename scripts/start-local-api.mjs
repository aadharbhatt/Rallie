import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runMigrations } from './migrate.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function localOptions(args, environment = process.env) {
  if (args.length !== 4 || args[0] !== '--env' || !['dev', 'test'].includes(args[1]) || args[2] !== '--ip' || !['127.0.0.1', '0.0.0.0'].includes(args[3])) throw new Error('Use --env dev|test --ip 127.0.0.1|0.0.0.0. Remote/production runtimes are forbidden.');
  for (const name of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_API_KEY', 'CLOUDFLARE_ACCOUNT_ID', 'AI_API_KEY', 'TALLY_TOKEN', 'TALLY_DEVICE_SECRET']) {
    if (environment[name]) throw new Error('Remove live credentials from the local emulator environment.');
  }
  const extraction = environment.RALLIE_MOCK_EXTRACTION ?? 'false';
  const tally = environment.RALLIE_MOCK_TALLY ?? 'false';
  if (![extraction, tally].every((value) => ['false', 'true'].includes(value))) throw new Error('Mock flags accept only explicit true/false.');
  const omit = environment.RALLIE_OMIT_BINDING ?? 'none';
  if (!['none', 'INGESTION_WORKFLOW', 'TALLY_CONNECTIONS'].includes(omit) || (omit !== 'none' && args[1] !== 'test')) throw new Error('Binding omission is an isolated test-only failure injection.');
  return { environment: args[1], ip: args[3], extraction, tally, omit };
}

export function startLocalApi(args) {
  const options = localOptions(args);
  const config = JSON.parse(readFileSync(resolve(root, 'wrangler.local.json'), 'utf8'));
  config.main = resolve(root, config.main);
  config.assets.directory = resolve(root, config.assets.directory);
  for (const [name, env] of Object.entries(config.env)) {
    env.vars = { RUNTIME_ENV: name, MOCK_EXTRACTION: options.extraction, MOCK_TALLY: options.tally };
    for (const database of env.d1_databases) database.migrations_dir = resolve(root, database.migrations_dir);
    if (options.omit === 'INGESTION_WORKFLOW') env.workflows = [];
    if (options.omit === 'TALLY_CONNECTIONS') env.durable_objects.bindings = [];
  }
  const directory = resolve(root, '.local/runtime-config');
  mkdirSync(directory, { recursive: true });
  const path = resolve(directory, `${options.environment}.json`);
  writeFileSync(path, JSON.stringify(config));
  runMigrations(['apply', '--env', options.environment]);
  const child = spawn(process.execPath, [resolve(root, 'node_modules/wrangler/bin/wrangler.js'), 'dev', '--config', path, '--env', options.environment, '--env-file', resolve(root, 'config/local-vars.txt'), '--local', '--ip', options.ip, '--port', '8787', '--persist-to', resolve(root, `.local/state/${options.environment}`)], { cwd: root, stdio: 'inherit', env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false', CLOUDFLARE_CF_FETCH_ENABLED: 'false', CLOUDFLARE_INCLUDE_PROCESS_ENV: 'false' } });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  child.on('error', () => { console.error('Local emulator could not start. No remote fallback attempted.'); process.exitCode = 1; });
  child.on('exit', (code) => { process.exitCode = code ?? 1; });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { startLocalApi(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}