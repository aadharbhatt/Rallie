import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { test } from 'node:test';
import { root, runMigrations } from './migrate.mjs';

test('real local D1: empty replay, harmless second apply, prior-state upgrade and version ledger', () => {
  mkdirSync(resolve(root, '.local'), { recursive: true });
  const directory = mkdtempSync(resolve(root, '.local/migration-test-'));
  const persistence = relative(root, directory);
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
  } finally { rmSync(directory, { recursive: true, force: true }); }
});