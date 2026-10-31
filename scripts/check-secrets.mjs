import { spawnSync } from 'node:child_process';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'node_modules', '.local', '.wrangler', 'dist', 'build', 'coverage', 'test-results', 'playwright-report']);
const signatures = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['aws-access-key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ['provider-token-assignment', /(?:CLOUDFLARE_API_TOKEN|AI_API_KEY|TALLY_TOKEN|TALLY_DEVICE_SECRET)["']?\s*[=:]\s*["']?([A-Za-z0-9_\-/+=]{32,})/],
];

/** Return rule names only: never return matched values or line contents. */
export function secretRules(text) {
  return signatures.filter(([, pattern]) => pattern.test(text)).map(([rule]) => rule);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

export function scanSecrets(workspace = root) {
  // Tracked files remain scanned even when newly ignored; archives use source-only exclusions.
  const top = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: workspace, encoding: 'utf8' });
  const git = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: workspace, encoding: 'utf8' });
  const paths = top.status === 0 && resolve(top.stdout.trim()) === resolve(workspace) && git.status === 0
    ? git.stdout.split('\0').filter(Boolean).map((name) => resolve(workspace, name)) : walk(workspace);
  const violations = [];
  for (const path of new Set(paths)) {
    let info;
    try { info = lstatSync(path); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    const name = relative(workspace, path).replaceAll('\\', '/');
    if (info.isSymbolicLink()) { violations.push({ file: name, rule: 'source-symlink' }); continue; }
    if (!info.isFile()) continue;
    if (/(?:^|\/)\.env(?:\.|$)|(?:^|\/)\.dev\.vars(?:\.|$)|\.(?:pem|key)$/.test(name) && !name.endsWith('.example')) violations.push({ file: name, rule: 'private-config-file' });
    const bytes = readFileSync(path);
    // Scan signatures even with embedded NULs; a binary prefix must not hide an ASCII token.
    for (const rule of secretRules(bytes.toString('utf8'))) violations.push({ file: name, rule });
  }
  return violations;
}

export function reportSecrets(violations, log = console.error) {
  for (const entry of violations) log(JSON.stringify(entry));
  return violations.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = reportSecrets(scanSecrets());
    if (!process.exitCode) console.log('Source secret/config signature scan passed (not a general credential-proof mechanism).');
  } catch { console.error('Source secret scan failed; file contents withheld.'); process.exitCode = 1; }
}