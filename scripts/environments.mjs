import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const environmentNames = ['dev', 'test', 'staging', 'production'];

export function exactOrigin(value, remote = false) {
  try {
    const url = new URL(value);
    return url.origin === value && !url.hostname.includes('*') && !url.username && !url.password && (remote
      ? url.protocol === 'https:' && url.hostname !== 'localhost' && !url.hostname.endsWith('.localhost') && !/^[\d.]+$/.test(url.hostname) && !url.hostname.includes(':')
      : url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname));
  } catch { return false; }
}

export function loadMatrix() {
  const matrix = JSON.parse(readFileSync(resolve(root, 'config/environments.json'), 'utf8'));
  const privatePath = resolve(root, '.local/provisioning.json');
  if (existsSync(privatePath)) {
    let provisioned;
    try { provisioned = JSON.parse(readFileSync(privatePath, 'utf8')); }
    catch { throw new Error('Invalid private provisioning JSON; values withheld.'); }
    if (Object.keys(provisioned).some((key) => !['staging', 'production'].includes(key))) throw new Error('Private provisioning may configure staging/production only.');
    for (const name of ['staging', 'production']) if (provisioned[name]) matrix[name] = provisioned[name];
  }
  return matrix;
}

/** Validation only: never imports a deployment client or starts a child process. */
export function setupStatus(matrix, target, secrets = {}) {
  if (!environmentNames.includes(target)) throw new Error('Use an explicit dev, test, staging or production environment.');
  const issues = [];
  const pending = new Set();
  const seen = new Map();
  for (const name of environmentNames) {
    const entry = matrix[name];
    const remote = !['dev', 'test'].includes(name);
    if (!entry || entry.mode !== (remote ? 'remote' : 'local') || entry.databaseName !== `rallie-${name}`) {
      issues.push(`${name}: invalid environment mode or database name.`);
      continue;
    }
    if (![undefined, false, 'false'].includes(entry.mockExtraction) || ![undefined, false, 'false'].includes(entry.mockTally)) issues.push(`${name}: provisioning must not enable mock services.`);
    if (!Array.isArray(entry.origins) || !entry.origins.length) pending.add(`${name}: configure an exact application origin.`);
    else {
      if (entry.origins.some((value) => !exactOrigin(value, remote)) || (remote && entry.origins.length !== 1)) issues.push(`${name}: invalid exact application origin.`);
      if (remote) for (const origin of entry.origins) {
        const key = `origin:${origin}`;
        if (seen.has(key)) issues.push('Remote environments must not share an origin.');
        seen.set(key, name);
      }
    }
    for (const field of ['databaseId', 'bucketName']) {
      const value = entry[field];
      if (!value) { pending.add(`${name}: provision a distinct ${field === 'databaseId' ? 'D1 database' : 'private R2 bucket'}.`); continue; }
      if (typeof value !== 'string' || (field === 'databaseId'
        ? !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(value) || (remote && value.startsWith('00000000-'))
        : !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(value) || (remote && value.startsWith('rallie-local-')))) issues.push(`${name}: invalid ${field}; values withheld.`);
      // UUID spelling is case-insensitive; a differently cased ID is not a new database.
      const key = `${field}:${field === 'databaseId' && typeof value === 'string' ? value.toLowerCase() : value}`;
      if (seen.has(key)) issues.push(`Environments must not share a ${field === 'databaseId' ? 'D1 database' : 'R2 bucket'}.`);
      seen.set(key, name);
    }
  }
  // The committed local binding declarations must match the validated matrix.
  const local = JSON.parse(readFileSync(resolve(root, 'wrangler.local.json'), 'utf8'));
  for (const name of ['dev', 'test']) {
    const configured = local.env[name];
    const database = configured?.d1_databases?.[0];
    const bucket = configured?.r2_buckets?.[0];
    if (configured?.d1_databases?.length !== 1 || configured?.r2_buckets?.length !== 1 || database?.binding !== 'DB' || bucket?.binding !== 'DOCUMENTS' || database?.database_name !== matrix[name]?.databaseName || database?.database_id !== matrix[name]?.databaseId || bucket?.bucket_name !== matrix[name]?.bucketName || database?.remote !== false || bucket?.remote !== false || database?.migrations_dir !== 'migrations') issues.push(`${name}: local binding matrix mismatch.`);
  }
  const missing = [...pending].filter((message) => message.startsWith(`${target}:`));
  if (['staging', 'production'].includes(target)) {
    for (const key of ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN']) if (!secrets[key]?.trim()) missing.push(`${target}: configure ${key} in the protected environment secret store.`);
    for (const key of ['MOCK_EXTRACTION', 'MOCK_TALLY', 'RALLIE_MOCK_EXTRACTION', 'RALLIE_MOCK_TALLY']) if (secrets[key] !== undefined && secrets[key] !== 'false') issues.push(`${target}: mock configuration is forbidden.`);
  }
  return { environment: target, status: issues.length ? 'invalid' : missing.length ? 'unprovisioned' : 'configured', issues, nextActions: missing, deploymentAttempted: false };
}

export function inspectEnvironment(args, secrets = process.env) {
  if (args.length !== 2 || args[0] !== '--env') throw new Error('Use --env dev|test|staging|production. This command never deploys.');
  return setupStatus(loadMatrix(), args[1], secrets);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = inspectEnvironment(process.argv.slice(2));
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'configured') process.exitCode = 2;
  } catch { console.error('Environment setup validation failed; check the matrix/private provisioning format. No deployment attempted; values withheld.'); process.exitCode = 2; }
}