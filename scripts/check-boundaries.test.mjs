import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkBoundaries } from './check-boundaries.mjs';

const directories = [];
afterEach(() => directories.splice(0).forEach((path) => rmSync(path, { recursive: true, force: true })));
function fixture(code, layer = 'apps/web') {
  const root = mkdtempSync(resolve(tmpdir(), 'rallie-boundaries-'));
  directories.push(root);
  for (const name of ['apps/web', 'apps/api', 'packages/domain', 'packages/api-contracts', 'packages/db']) {
    mkdirSync(resolve(root, name, 'src'), { recursive: true });
    writeFileSync(resolve(root, name, 'package.json'), readFileSync(new URL(`../${name}/package.json`, import.meta.url)));
  }
  const file = resolve(root, layer, 'src/fixture.ts');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, code);
  return root;
}
describe('architectural import boundaries', () => {
  it('accepts the real workspace', () => expect(checkBoundaries()).toEqual([]));
  it.each([
    "import type { Env } from '../../api/src/env';",
    "export * from '../../api/src/index';",
    "const server = import('../../api/src/index');",
    "type Env = import('../../api/src/env').Env;",
    "import { probeDatabase } from '@rallie/db';",
    "import type { D1Database } from '@cloudflare/workers-types';",
    "import { readFile } from 'node:fs';",
    'const server = import(serverPath);',
  ])('rejects server-binding imports in browser source: %s', (code) => {
    expect(checkBoundaries(fixture(code))).toHaveLength(1);
  });
  it('rejects transitive server imports through shared contracts', () => {
    expect(checkBoundaries(fixture("export * from '../../../apps/api/src/env';", 'packages/api-contracts'))).toHaveLength(1);
  });
  it('permits browser-safe shared modules', () => {
    expect(checkBoundaries(fixture("import { healthSchema } from '@rallie/api-contracts';"))).toEqual([]);
  });
});