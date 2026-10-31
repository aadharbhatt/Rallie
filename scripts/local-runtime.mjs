import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function runtimePlan(args) {
  const [action, flag, environment, ...extra] = args;
  if (!['up', 'down', 'smoke', 'reset', 'verify'].includes(action) || flag !== '--env' || !['dev', 'test'].includes(environment)) throw new Error('Use up|down|smoke|reset|verify --env dev|test. Production and implicit environments are forbidden.');
  if (action === 'reset' && (environment !== 'test' || extra.join(' ') !== '--confirm DELETE_LOCAL_TEST')) throw new Error('Reset is test-only and requires --confirm DELETE_LOCAL_TEST. Dev/production state is never removed.');
  const browser = action === 'verify' && extra.length === 1 && extra[0] === '--browser';
  if (action !== 'reset' && extra.length && !browser) throw new Error('Unknown local runtime options.');
  if (action === 'verify' && environment !== 'test') throw new Error('Runtime verification is isolated to its own test project.');
  return { action, environment, browser, project: action === 'verify' ? 'rallie-verify-test' : `rallie-local-${environment}`, apiPort: environment === 'dev' ? '8788' : '8789', webPort: environment === 'dev' ? '5174' : '5175' };
}

export async function localRuntime(args) {
  const plan = runtimePlan(args);
  const flags = { RALLIE_MOCK_EXTRACTION: process.env.RALLIE_MOCK_EXTRACTION ?? 'false', RALLIE_MOCK_TALLY: process.env.RALLIE_MOCK_TALLY ?? 'false', RALLIE_OMIT_BINDING: 'none' };
  if (![flags.RALLIE_MOCK_EXTRACTION, flags.RALLIE_MOCK_TALLY].every((value) => ['false', 'true'].includes(value))) throw new Error('Mock flags accept only explicit true/false.');
  const compose = (...commands) => {
    const result = spawnSync('docker', ['compose', '--env-file', resolve(root, 'config/local-vars.txt'), '-f', resolve(root, 'compose.local.yaml'), '-p', plan.project, ...commands], {
      cwd: root, encoding: 'utf8', env: { ...process.env, ...flags, RALLIE_LOCAL_ENV: plan.environment, RALLIE_API_PORT: plan.apiPort, RALLIE_WEB_PORT: plan.webPort },
    });
    if (result.error || result.status !== 0) {
      console.error(result.stdout, result.stderr);
      throw new Error('Local Docker operation failed; no remote fallback attempted.');
    }
    console.log(`Docker ${commands.join(' ')}: passed`);
  };
  const api = `http://127.0.0.1:${plan.apiPort}`;
  const get = async (path, method = 'GET') => {
    // Container restarts invalidate pooled sockets. Retry only safe reads, never a smoke POST.
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await fetch(`${api}${path}`, { method, headers: { Connection: 'close' }, signal: AbortSignal.timeout(10_000) });
        return { response, body: await response.json() };
      } catch (error) {
        if (method !== 'GET' || attempt >= 10) throw error;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  };
  const smoke = async () => {
    const { response, body } = await get('/api/__local/smoke', 'POST');
    assert.equal(response.status, 200);
    assert.equal(body.scope, 'local-foundation-smoke');
    for (const name of ['database', 'documents', 'durableObject']) assert.equal(body[name], true, name);
    for (let attempt = 0; attempt < 60; attempt++) {
      const workflow = await get(`/api/__local/workflow/${body.workflowId}`);
      assert.equal(workflow.response.status, 200);
      if (workflow.body.status === 'complete') {
        assert.equal(workflow.body.verified, true);
        console.log('Real local D1/R2 read-write, persisted DO request and Workflow completion: passed');
        return body.workflowId;
      }
      assert.ok(!['errored', 'terminated'].includes(workflow.body.status), 'Workflow must not fail');
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error('Workflow smoke did not complete within the bounded test deadline.');
  };
  const up = (build = false) => compose('up', '-d', ...(build ? ['--build'] : []), '--wait', '--wait-timeout', '120');
  if (plan.action === 'up') { up(true); console.log(`Web: http://127.0.0.1:${plan.webPort}; Worker: ${api}`); return; }
  if (plan.action === 'down') { compose('down'); return; }
  if (plan.action === 'smoke') { await smoke(); return; }
  if (plan.action === 'reset') { compose('down', '--volumes'); console.log('Only the fixed local test project volume was removed. Next up reapplies migrations.'); return; }
  flags.RALLIE_MOCK_EXTRACTION = 'false'; flags.RALLIE_MOCK_TALLY = 'false';
  const runBrowser = (name, baseURL) => {
    const result = spawnSync(process.execPath, [resolve(root, 'node_modules/@playwright/test/cli.js'), 'test', '--config', resolve(root, 'tests/playwright.config.ts')], {
      cwd: root, stdio: 'inherit', env: { ...process.env, CI: 'true', PLAYWRIGHT_BASE_URL: baseURL, RALLIE_BROWSER_GATE: name },
    });
    if (result.error || result.status !== 0) throw new Error(`Chromium ${name} foundation gate failed.`);
  };
  try {
    compose('down', '--volumes'); up(true);
    const health = (await get('/health')).body;
    assert.deepEqual(health.runtime, { environment: 'test', extraction: 'unavailable', tally: 'unavailable' });
    for (const name of ['documents', 'assets', 'ingestionWorkflow', 'tallyConnections']) assert.equal(health.bindings[name], 'configured');
    if (plan.browser) {
      runBrowser('worker', api);
      runBrowser('web', `http://127.0.0.1:${plan.webPort}`);
    }
    const empty = (await get('/api/__local/smoke')).body;
    for (const name of ['database', 'documents', 'durableObject']) assert.equal(empty[name], false);
    const workflowId = await smoke();
    compose('restart', 'worker', 'web'); up();
    const persisted = (await get('/api/__local/smoke')).body;
    for (const name of ['database', 'documents', 'durableObject']) assert.equal(persisted[name], true);
    assert.equal((await get(`/api/__local/workflow/${workflowId}`)).body.verified, true);
    console.log('D1/R2/DO data and completed Workflow survive container restart: passed');
    compose('stop', 'worker');
    const unavailable = await fetch(`http://127.0.0.1:${plan.webPort}/health`, { signal: AbortSignal.timeout(10_000) });
    assert.ok(unavailable.status >= 500, 'Stopped API must not be replaced by mock success');
    up();
    for (const [extraction, tally] of [['true', 'false'], ['false', 'true'], ['true', 'true'], ['false', 'false']]) {
      flags.RALLIE_MOCK_EXTRACTION = extraction; flags.RALLIE_MOCK_TALLY = tally;
      compose('up', '-d', '--no-deps', '--force-recreate', '--wait', '--wait-timeout', '120', 'worker');
      const runtime = (await get('/health')).body.runtime;
      assert.equal(runtime.extraction, extraction === 'true' ? 'mock_stub' : 'unavailable');
      assert.equal(runtime.tally, tally === 'true' ? 'mock_stub' : 'unavailable');
    }
    console.log('Independent explicit mock flags, both flags, and default-off recovery: passed');
    for (const omit of ['INGESTION_WORKFLOW', 'TALLY_CONNECTIONS']) {
      flags.RALLIE_OMIT_BINDING = omit;
      compose('up', '-d', '--no-deps', '--force-recreate', '--wait', '--wait-timeout', '120', 'worker');
      const missing = await get('/api/__local/smoke', 'POST');
      assert.equal(missing.response.status, 503);
      assert.equal(missing.body.code, 'binding_unavailable');
    }
    console.log('Removed Workflow and DO bindings fail explicitly without mock fallback: passed');
    flags.RALLIE_OMIT_BINDING = 'none';
    compose('down', '--volumes'); up();
    const reset = (await get('/api/__local/smoke')).body;
    for (const name of ['database', 'documents', 'durableObject']) assert.equal(reset[name], false);
    assert.equal((await get('/health')).body.database.status, 'ok');
    await smoke();
    console.log('Disposable test-volume reset removed fixtures; migration replay and all bindings recover: passed');
  } catch (error) {
    compose('logs', '--no-color', '--tail=40', 'worker', 'web');
    throw error;
  } finally { compose('down', '--volumes'); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  localRuntime(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}