import { DurableObject, WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
import type { Env } from './env';
import { handleRequest } from './index';
import { localSmoke } from './local-smoke';

/** Emulator smoke only. No extraction, ingestion state or real Tally protocol. */
export class FoundationSmokeWorkflow extends WorkflowEntrypoint<Env> {
  async run(_event: WorkflowEvent<unknown>, step: WorkflowStep): Promise<string> {
    return step.do('foundation-smoke', async () => 'ral002-foundation-smoke');
  }
}

export class FoundationSmokeObject extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'POST') await this.ctx.storage.put('marker', 'ral002-foundation-smoke');
    return new Response(await this.ctx.storage.get<string>('marker') ?? 'absent');
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return new URL(request.url).pathname.startsWith('/api/__local') ? localSmoke(request, env) : handleRequest(request, env);
  },
};