import { createHash, randomUUID } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { localPath, statePath } from './local-state.mjs';

function fingerprints(directory, prefix = '') {
  if (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink()) throw new Error('Recovery state must be a real directory.');
  return Object.fromEntries(readdirSync(directory).sort().flatMap((name) => {
    const path = resolve(directory, name);
    const key = `${prefix}${name}`;
    const info = lstatSync(path);
    if (info.isSymbolicLink() || (!info.isFile() && !info.isDirectory())) throw new Error('Recovery points cannot contain symlinks or special files.');
    return info.isDirectory() ? Object.entries(fingerprints(path, `${key}/`))
      : [[key, createHash('sha256').update(readFileSync(path)).digest('hex')]];
  }));
}

export function recoveryPlan(args) {
  const [action, ...options] = args;
  if (!['backup', 'restore'].includes(action)) throw new Error('Use backup|restore; this is local test recovery only, never production.');
  const values = {};
  for (let i = 0; i < options.length; i += 2) {
    if (!['--env', '--persist-to', '--snapshot', '--confirm'].includes(options[i]) || !options[i + 1] || values[options[i]]) throw new Error('Use --env test --persist-to <local test state> --snapshot .local/backups/<name> --confirm <approval>.');
    values[options[i]] = options[i + 1];
  }
  if (values['--env'] !== 'test') throw new Error('Recovery rehearsal is test-only. Dev/staging/production restore is forbidden.');
  const state = statePath('test', values['--persist-to']);
  if (!values['--snapshot']) throw new Error('An explicit recovery point is required.');
  const snapshot = localPath(values['--snapshot']);
  const backupRoot = localPath('.local/backups');
  const inside = relative(backupRoot, snapshot);
  if (!inside || inside.startsWith('..') || isAbsolute(inside)) throw new Error('Snapshot must be under .local/backups/.');
  if (values['--confirm'] !== (action === 'backup' ? 'STOPPED_LOCAL_TEST' : 'RESTORE_STOPPED_LOCAL_TEST')) throw new Error('Stop the target runtime, then explicitly approve STOPPED_LOCAL_TEST or RESTORE_STOPPED_LOCAL_TEST.');
  if (!existsSync(resolve(state, '.rallie-environment')) || readFileSync(resolve(state, '.rallie-environment'), 'utf8') !== 'test') throw new Error('Target must be existing claimed local test state.');
  if (action === 'backup' && existsSync(snapshot)) throw new Error('Recovery point already exists; choose a new name.');
  let manifest;
  if (action === 'restore') {
    try {
      if (!lstatSync(resolve(snapshot, 'manifest.json')).isFile() || lstatSync(resolve(snapshot, 'manifest.json')).isSymbolicLink()) throw new Error('Invalid manifest.');
      manifest = JSON.parse(readFileSync(resolve(snapshot, 'manifest.json'), 'utf8'));
    }
    catch { throw new Error('Missing/invalid recovery point. Restore blocked before changing state.'); }
    if (!manifest || manifest.version !== 1 || manifest.environment !== 'test' || manifest.state !== state || JSON.stringify(manifest.files) !== JSON.stringify(fingerprints(resolve(snapshot, 'state')))) throw new Error('Recovery point target/integrity mismatch. Restore blocked.');
  }
  return { action, state, snapshot, manifest };
}

/** Offline-only rehearsal; caller must stop Wrangler/container before approval. */
export function runRecovery(args) {
  const plan = recoveryPlan(args);
  if (plan.action === 'backup') {
    const files = fingerprints(plan.state);
    mkdirSync(plan.snapshot, { recursive: true });
    cpSync(plan.state, resolve(plan.snapshot, 'state'), { recursive: true });
    // Reject a moving source; this is not a hot backup protocol.
    if (JSON.stringify(files) !== JSON.stringify(fingerprints(plan.state)) || JSON.stringify(files) !== JSON.stringify(fingerprints(resolve(plan.snapshot, 'state')))) throw new Error('State changed during backup; recovery point is unusable. Stop the runtime.');
    writeFileSync(resolve(plan.snapshot, 'manifest.json'), JSON.stringify({ version: 1, environment: 'test', state: plan.state, files }, null, 2));
  } else {
    const displaced = `${plan.state}.before-restore-${randomUUID()}`;
    // Keep the pre-restore state for diagnosis; never delete it automatically.
    const prepared = `${plan.state}.restore-${randomUUID()}`;
    cpSync(resolve(plan.snapshot, 'state'), prepared, { recursive: true });
    renameSync(plan.state, displaced);
    try { renameSync(prepared, plan.state); }
    catch (error) { renameSync(displaced, plan.state); throw error; }
  }
  console.log(`Local test ${plan.action} completed. No remote command or deployment was attempted.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { runRecovery(process.argv.slice(2)); }
  catch { console.error('Recovery blocked: check test target, stopped-runtime approval, and recovery-point integrity. State/secret values withheld.'); process.exitCode = 1; }
}