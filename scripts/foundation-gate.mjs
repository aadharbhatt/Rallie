import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const skippedIntegrations = [
  'Cloudflare provisioning/deployment and live backup/restore (RAL-006)',
  'Real Workers AI PDF extraction (later ingestion gate)',
  'Windows/Tally and real accounting effects (later Tally gate)',
];
export function gateSteps() {
  return [
    ['lockfile install', ['ci', '--no-audit', '--no-fund']],
    ['source secret scan', ['run', 'check:secrets']],
    ['lint', ['run', 'lint']],
    ['typed boundaries and contracts', ['run', 'typecheck']],
    ['unit and negative contracts', ['test']],
    ['real local D1 replay/upgrade/restore and D1/R2 isolation', ['run', 'test:migrations']],
    ['web/production-entry Worker dry-run and bundle audits', ['run', 'build']],
    ['Docker four-binding persistence/failure gate and Chromium shell', ['run', 'test:runtime', '--', '--browser']],
  ];
}

export function gateEnvironment(env) {
  for (const key of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_API_KEY', 'CLOUDFLARE_ACCOUNT_ID', 'AI_API_KEY', 'TALLY_TOKEN', 'TALLY_DEVICE_SECRET']) {
    if (env[key]) throw new Error('Remove live credentials before running the local foundation gate; values withheld.');
  }
  return { ...env, CI: 'true', WRANGLER_SEND_METRICS: 'false', CLOUDFLARE_CF_FETCH_ENABLED: 'false', CLOUDFLARE_INCLUDE_PROCESS_ENV: 'false', RALLIE_MOCK_EXTRACTION: 'false', RALLIE_MOCK_TALLY: 'false' };
}

export function runGate(args = [], execute = spawnSync, env = process.env, workspace = root) {
  if (args.length) throw new Error('Use verify:foundation without options; no skip/deploy/remote target exists.');
  const environment = gateEnvironment(env);
  const directory = resolve(workspace, '.local/foundation-gate');
  mkdirSync(directory, { recursive: true });
  const commit = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: workspace, encoding: 'utf8' });
  const tree = spawnSync('git', ['status', '--porcelain'], { cwd: workspace, encoding: 'utf8' });
  const summary = { schemaVersion: 1, startedAt: new Date().toISOString(), commit: commit.status === 0 ? commit.stdout.trim() : 'source-archive', workingTreeDirty: tree.status === 0 ? Boolean(tree.stdout.trim()) : null, status: 'running', checks: [], liveIntegrations: skippedIntegrations.map((name) => ({ name, status: 'skipped' })), deploymentAttempted: false };
  const save = () => writeFileSync(resolve(directory, 'summary.json'), JSON.stringify(summary, null, 2));
  save();
  try {
    // Never publish reports from a previous successful run after an early failure.
    for (const target of ['worker', 'web']) {
      rmSync(resolve(workspace, 'test-results', target), { recursive: true, force: true });
      rmSync(resolve(workspace, 'playwright-report', target), { recursive: true, force: true });
    }
    for (const [name, command] of gateSteps()) {
      console.log(`\nFoundation gate: ${name}`);
      const result = execute(process.platform === 'win32' ? 'npm.cmd' : 'npm', command, { cwd: workspace, stdio: 'inherit', env: environment });
      const passed = !result.error && result.status === 0;
      summary.checks.push({ name, status: passed ? 'passed' : 'failed' });
      save();
      if (!passed) throw new Error(`Foundation gate failed: ${name}. See the failing check; no deployment attempted.`);
    }
    summary.status = 'passed';
  } catch (error) { summary.status = 'failed'; throw error; }
  finally {
    summary.finishedAt = new Date().toISOString();
    save();
    for (const item of summary.liveIntegrations) console.log(`SKIPPED: ${item.name}`);
    console.log(`Foundation result: ${summary.status}; summary saved under .local/foundation-gate/. No deployment attempted.`);
  }
  return summary;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { runGate(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}