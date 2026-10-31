import type { HealthResponse, RuntimeStatus } from '@rallie/api-contracts';

export function RuntimeNotice({ runtime, database }: { runtime: RuntimeStatus; database?: HealthResponse['database']['status'] }) {
  return <div className="runtime-notice" role="status" aria-label="Runtime environment">
    <strong>{runtime.environment === 'dev' ? 'Local development — nonproduction' : runtime.environment === 'test' ? 'Local test — nonproduction' : runtime.environment === 'staging' ? 'Staging — nonproduction' : runtime.environment === 'production' ? 'Production' : 'Environment unconfigured'}</strong>
    {database && database !== 'ok' && <p>{database === 'not_configured' ? 'API unready — D1 is not configured.' : 'API unready — the D1 probe failed.'} This is not a failed business operation.</p>}
    <p>{runtime.extraction === 'mock_stub' ? 'Mock extraction enabled — stub only; no PDF extraction.' : 'PDF extraction unavailable — mock off.'}</p>
    <p>{runtime.tally === 'mock_stub' ? 'Mock Tally enabled — stub only; no accounting connection.' : 'Tally unavailable — mock off.'}</p>
  </div>;
}