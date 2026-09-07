// Entrypoint local: sobe o Fastify na porta 3001 (ver .env.example / PORT).

import { buildApp } from './app';

async function main() {
  const app = await buildApp();
  const port = Number(process.env.PORT ?? 3001);

  await app.listen({ port, host: '0.0.0.0' });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
