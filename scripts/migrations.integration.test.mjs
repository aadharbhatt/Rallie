import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { test } from 'node:test';
import { root, runMigrations } from './migrate.mjs';
import { runRecovery, recoveryPlan } from './recovery.mjs';
import { getPlatformProxy } from 'wrangler';

test('real local D1: empty replay, repeat, bootstrap upgrade, ledger and offline backup/restore', () => {
  mkdirSync(resolve(root, '.local'), { recursive: true });
  const directory = mkdtempSync(resolve(root, '.local/migration-test-'));
  const persistence = relative(root, directory);
  const snapshot = `.local/backups/${directory.split('/').pop()}`;
  const execute = (args) => {
    const result = spawnSync(process.execPath, [resolve(root, 'node_modules/wrangler/bin/wrangler.js'), '--config', resolve(root, 'wrangler.jsonc'), '--env', 'test', ...args, '--local', '--persist-to', directory], {
      cwd: root, encoding: 'utf8', env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' },
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    return result.stdout;
  };
  const query = (sql) => {
    const output = JSON.parse(execute(['d1', 'execute', 'DB', '--command', sql, '--json']));
    assert.equal(output[0].success, true);
    return output[0].results;
  };
  try {
    runMigrations(['apply', '--env', 'test', '--persist-to', persistence]);
    assert.deepEqual(query('SELECT key, value FROM foundation_metadata'), [{ key: 'schema_stage', value: 'foundation' }]);
    const versions = query('SELECT name FROM d1_migrations ORDER BY id');
    assert.deepEqual(versions, [{ name: '0001_foundation.sql' }]);
    // The latest baseline is already applied; repeat apply must preserve existing data.
    query("INSERT INTO foundation_metadata (key, value) VALUES ('upgrade_sentinel', 'preserve')");
    runMigrations(['apply', '--env', 'test', '--persist-to', persistence]);
    assert.deepEqual(query('SELECT name FROM d1_migrations ORDER BY id'), versions);
    assert.deepEqual(query("SELECT value FROM foundation_metadata WHERE key = 'upgrade_sentinel'"), [{ value: 'preserve' }]);
    const tables = query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name");
    assert.deepEqual(tables.map(({ name }) => name), ['d1_migrations', 'foundation_metadata']);
    // Upgrade the pre-runner bootstrap state: schema/data exist but no Wrangler ledger.
    query('DROP TABLE d1_migrations');
    runMigrations(['apply', '--env', 'test', '--persist-to', persistence]);
    assert.deepEqual(query('SELECT name FROM d1_migrations ORDER BY id'), versions);
    assert.deepEqual(query("SELECT value FROM foundation_metadata WHERE key = 'upgrade_sentinel'"), [{ value: 'preserve' }]);
    // Each CLI process has exited: the emulator is offline before copying its state.
    const recoveryArgs = ['--env', 'test', '--persist-to', persistence, '--snapshot', snapshot];
    assert.throws(() => recoveryPlan(['restore', ...recoveryArgs, '--confirm', 'RESTORE_STOPPED_LOCAL_TEST']), /Missing\/invalid/);
    runRecovery(['backup', ...recoveryArgs, '--confirm', 'STOPPED_LOCAL_TEST']);
    query("UPDATE foundation_metadata SET value = 'changed-after-backup' WHERE key = 'upgrade_sentinel'");
    runRecovery(['restore', ...recoveryArgs, '--confirm', 'RESTORE_STOPPED_LOCAL_TEST']);
    assert.deepEqual(query("SELECT value FROM foundation_metadata WHERE key = 'upgrade_sentinel'"), [{ value: 'preserve' }]);
    assert.deepEqual(query('SELECT name FROM d1_migrations ORDER BY id'), versions);
    runMigrations(['apply', '--env', 'test', '--persist-to', persistence]);
    assert.deepEqual(query("SELECT value FROM foundation_metadata WHERE key = 'upgrade_sentinel'"), [{ value: 'preserve' }]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
    rmSync(resolve(root, snapshot), { recursive: true, force: true });
    for (const name of readdirSync(resolve(root, '.local'))) if (name.startsWith(`${directory.split('/').pop()}.before-restore-`)) rmSync(resolve(root, '.local', name), { recursive: true, force: true });
  }
});

test('real local D1/R2: four distinct environment bindings cannot read each other (remote names use synthetic local-only fixtures)', async () => {
  mkdirSync(resolve(root, '.local'), { recursive: true });
  const directory = mkdtempSync(resolve(root, '.local/isolation-test-'));
  const config = JSON.parse(readFileSync(resolve(root, 'wrangler.local.json'), 'utf8'));
  for (const [index, environment] of ['staging', 'production'].entries()) {
    config.env[environment] = {
      name: `fixture-${environment}`,
      d1_databases: [{ binding: 'DB', database_name: `fixture-${environment}`, database_id: `12345678-1234-1234-1234-12345678900${index}`, remote: false }],
      r2_buckets: [{ binding: 'DOCUMENTS', bucket_name: `fixture-${environment}-documents`, remote: false }],
    };
  }
  // Only test delivered storage bindings here; Workflow/DO behavior has its own Docker gate.
  config.main = resolve(root, 'apps/api/src/index.ts');
  delete config.assets;
  delete config.migrations;
  for (const entry of Object.values(config.env)) {
    delete entry.workflows;
    delete entry.durable_objects;
    entry.d1_databases[0].migrations_dir = resolve(root, 'migrations');
  }
  const configPath = resolve(directory, 'bindings.json');
  writeFileSync(configPath, JSON.stringify(config));
  const open = (environment) => getPlatformProxy({ configPath, environment, envFiles: [resolve(root, 'config/local-vars.txt')], remoteBindings: false, persist: { path: resolve(directory, 'shared-state') } });
  try {
    for (const environment of ['dev', 'test', 'staging', 'production']) {
      const proxy = await open(environment);
      try {
        await proxy.env.DB.prepare('CREATE TABLE isolation_marker (value TEXT NOT NULL)').run();
        assert.deepEqual((await proxy.env.DB.prepare('SELECT value FROM isolation_marker').all()).results, []);
        assert.equal(await proxy.env.DOCUMENTS.get('isolation-marker'), null);
        await proxy.env.DB.prepare('INSERT INTO isolation_marker (value) VALUES (?)').bind(environment).run();
        await proxy.env.DOCUMENTS.put('isolation-marker', environment);
      } finally { await proxy.dispose(); }
    }
    for (const environment of ['dev', 'test', 'staging', 'production']) {
      const proxy = await open(environment);
      try {
        assert.deepEqual((await proxy.env.DB.prepare('SELECT value FROM isolation_marker').all()).results, [{ value: environment }]);
        assert.equal(await (await proxy.env.DOCUMENTS.get('isolation-marker')).text(), environment);
      } finally { await proxy.dispose(); }
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});