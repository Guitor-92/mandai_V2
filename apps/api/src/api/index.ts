// Handler Vercel — mantém um Fastify singleton entre invocações (warm
// starts). Ver ARQUITETURA.md §5.2 e vercel.json.

import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp } from '../app';

let appPromise: ReturnType<typeof buildApp> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!appPromise) {
    appPromise = buildApp();
  }
  const app = await appPromise;
  await app.ready();
  app.server.emit('request', req, res);
}
