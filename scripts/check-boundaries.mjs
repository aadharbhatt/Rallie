import { readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const layers = ['apps/web', 'apps/api', 'packages/domain', 'packages/api-contracts', 'packages/db'];
const allowed = {
  'apps/web': ['apps/web', 'packages/domain', 'packages/api-contracts'],
  'apps/api': ['apps/api', 'packages/domain', 'packages/api-contracts', 'packages/db'],
  'packages/domain': ['packages/domain'],
  'packages/api-contracts': ['packages/api-contracts'],
  'packages/db': ['packages/db', 'packages/domain'],
};
const layerOf = (path) => layers.find((layer) => path.startsWith(`${layer}/`));

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : /\.[cm]?[jt]sx?$/.test(path) ? [path] : [];
  });
}

/** Inspect type-only imports, barrels, dynamic imports, and shared sources too. */
export function checkBoundaries(workspace = root) {
  const violations = [];
  for (const layer of layers) {
    const manifest = JSON.parse(readFileSync(resolve(workspace, layer, 'package.json'), 'utf8'));
    const dependencies = new Set(Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }));
    for (const file of files(resolve(workspace, layer, 'src'))) {
      const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      const inspect = (node) => {
        let specifier;
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) specifier = node.moduleSpecifier;
        if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) specifier = node.argument.literal;
        if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(source) === 'require')) specifier = node.arguments[0];
        if (specifier && !ts.isStringLiteralLike(specifier)) {
          violations.push(`${relative(workspace, file)}: non-literal module imports cannot be boundary-checked`);
        } else if (specifier && ts.isStringLiteralLike(specifier)) {
          const name = specifier.text;
          const packageName = name.startsWith('@') ? name.split('/').slice(0, 2).join('/') : name.split('/')[0];
          const sharedLayer = name.startsWith('@rallie/') ? `packages/${name.split('/')[1]}` : undefined;
          const target = name.startsWith('.') ? relative(workspace, resolve(dirname(file), name)) : sharedLayer ? `${sharedLayer}/src/index.ts` : undefined;
          const destination = target && layerOf(target);
          const isTest = file.endsWith('.test.ts');
          const permitted = target
            ? Boolean(destination && allowed[layer].includes(destination))
            : dependencies.has(packageName) || (isTest && name === 'vitest');
          if (!permitted) violations.push(`${relative(workspace, file)}: forbidden import ${name}`);
        }
        ts.forEachChild(node, inspect);
      };
      inspect(source);
    }
  }
  return violations;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const violations = checkBoundaries();
  if (violations.length) {
    console.error(violations.join('\n'));
    process.exitCode = 1;
  } else console.log('Browser, Worker, domain, API-contract, and database boundaries pass.');
}