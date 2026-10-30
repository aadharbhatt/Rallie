import type { RuntimeStatus } from '@rallie/api-contracts';

export function RuntimeNotice({ runtime }: { runtime: RuntimeStatus }) {
  return <div className="runtime-notice" role="status" aria-label="Runtime environment">
    <strong>{runtime.environment === 'dev' ? 'Local development' : runtime.environment === 'test' ? 'Local test' : runtime.environment === 'production' ? 'Production' : 'Environment unconfigured'}</strong>
    <p>{runtime.extraction === 'mock_stub' ? 'Mock extraction enabled — stub only; no PDF extraction.' : 'PDF extraction unavailable — mock off.'}</p>
    <p>{runtime.tally === 'mock_stub' ? 'Mock Tally enabled — stub only; no accounting connection.' : 'Tally unavailable — mock off.'}</p>
  </div>;
}