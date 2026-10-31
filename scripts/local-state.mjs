import { existsSync, lstatSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Reject lexical escapes AND symlink aliases, including a symlinked .local. */
export function localPath(value) {
  const path = resolve(root, value);
  const inside = relative(resolve(root, '.local'), path);
  if (!inside || inside.startsWith('..') || isAbsolute(inside)) throw new Error('Target must be a directory inside .local/.');
  let current = path;
  while (current !== root) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error('Symlinked local targets are forbidden.');
    // lstat also catches a dangling symlink, which existsSync does not.
    try { if (lstatSync(current).isSymbolicLink()) throw new Error('Symlinked local targets are forbidden.'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    current = dirname(current);
  }
  return path;
}

export function statePath(environment, value = `.local/state/${environment}`) {
  if (!['dev', 'test'].includes(environment)) throw new Error('Only explicit dev/test local state is allowed.');
  const path = localPath(value);
  const reserved = relative(resolve(root, '.local'), path).split(/[\\/]/);
  if (reserved[0] === 'backups' || reserved[0] === 'runtime-config' || (reserved[0] === 'state' && reserved[1] !== environment)) throw new Error('State target belongs to a different or reserved namespace.');
  const marker = resolve(path, '.rallie-environment');
  if (existsSync(marker) && readFileSync(marker, 'utf8') !== environment) throw new Error('State directory is already owned by another environment.');
  for (let parent = dirname(path); parent !== resolve(root, '.local'); parent = dirname(parent)) {
    if (existsSync(resolve(parent, '.rallie-environment'))) throw new Error('Nested state directories are forbidden; choose an independent environment root.');
  }
  return path;
}

export function claimState(environment, path) {
  statePath(environment, path);
  mkdirSync(path, { recursive: true });
  const marker = resolve(path, '.rallie-environment');
  try { writeFileSync(marker, environment, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  statePath(environment, path);
}