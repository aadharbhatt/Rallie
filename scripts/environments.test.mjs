import { describe, expect, it } from 'vitest';
import { loadMatrix, setupStatus } from './environments.mjs';

const secrets = { CLOUDFLARE_API_TOKEN: 'synthetic-not-a-token', CLOUDFLARE_ACCOUNT_ID: 'synthetic-not-an-account' };
function provisioned() {
  const matrix = loadMatrix();
  for (const [index, name] of ['staging', 'production'].entries()) matrix[name] = {
    mode: 'remote', databaseName: `rallie-${name}`, databaseId: `12345678-1234-1234-1234-12345678900${index}`,
    bucketName: `fixture-${name}-documents`, origins: [`https://${name}.example.invalid`],
  };
  return matrix;
}

describe('environment provisioning validation (no deployment)', () => {
  it('accepts distinct provisioned targets and committed local bindings', () => {
    const matrix = provisioned();
    for (const name of Object.keys(matrix)) expect(setupStatus(matrix, name, secrets)).toMatchObject({ status: 'configured', deploymentAttempted: false });
  });
  it.each(['databaseId', 'bucketName', 'origins'])('rejects shared remote %s without printing its value', (field) => {
    const matrix = provisioned();
    matrix.production[field] = matrix.staging[field];
    const result = setupStatus(matrix, 'production', secrets);
    expect(result.status).toBe('invalid');
    expect(JSON.stringify(result)).not.toContain('12345678');
    expect(JSON.stringify(result)).not.toContain('fixture-staging-documents');
  });
  it('rejects crossing the local/remote boundary and local config drift', () => {
    const matrix = provisioned();
    matrix.production.databaseId = matrix.dev.databaseId;
    matrix.test.bucketName = matrix.dev.bucketName;
    expect(setupStatus(matrix, 'production', secrets).status).toBe('invalid');
  });
  it('rejects case-variant reuse of the same D1 UUID', () => {
    const matrix = provisioned();
    matrix.staging.databaseId = 'abcdefab-abcd-abcd-abcd-abcdefabcdef';
    matrix.production.databaseId = matrix.staging.databaseId.toUpperCase();
    expect(setupStatus(matrix, 'production', secrets).issues.join(' ')).toContain('share a D1 database');
  });
  it.each(['https://*.example.invalid', 'http://production.example.invalid', 'https://production.example.invalid/path', 'https://user:pass@production.example.invalid', 'https://localhost', 'https://app.localhost', 'https://127.0.0.2', 'https://[::1]'])('rejects unsafe remote origin %s', (origin) => {
    const matrix = provisioned();
    matrix.production.origins = [origin];
    expect(setupStatus(matrix, 'production', secrets).status).toBe('invalid');
  });
  it('reports absent resources/credentials as actionable setup, not failed deployment', () => {
    const result = setupStatus(loadMatrix(), 'production');
    expect(result.status).toBe('unprovisioned');
    expect(result.nextActions.join(' ')).toContain('CLOUDFLARE_API_TOKEN');
    expect(result.deploymentAttempted).toBe(false);
  });
  it('reports only absent secrets for an otherwise valid target and never returns secrets', () => {
    const matrix = provisioned();
    expect(setupStatus(matrix, 'production').nextActions).toHaveLength(2);
    expect(JSON.stringify(setupStatus(matrix, 'production', secrets))).not.toContain(secrets.CLOUDFLARE_API_TOKEN);
  });
  it.each(['true', '1', 'TRUE'])('blocks production mock flags %s', (value) => {
    expect(setupStatus(provisioned(), 'production', { ...secrets, RALLIE_MOCK_TALLY: value }).status).toBe('invalid');
  });
});