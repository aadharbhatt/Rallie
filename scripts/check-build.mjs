import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) inspect(path);
    else {
      const text = readFileSync(path, 'utf8');
      if (entry.name.endsWith('.map') || /SELECT 1 AS ok|foundation_metadata|CLOUDFLARE_API_TOKEN|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}/.test(text)) {
        throw new Error('Browser build contains server-only code, a source map, or a credential signature.');
      }
    }
  }
}
inspect(resolve('apps/web/dist'));
console.log('Browser bundle audit passed: no server SQL/bindings, source maps, or known credential signatures. This is not a substitute for secret-store hygiene.');