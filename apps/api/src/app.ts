// buildApp(): cria a instância Fastify, registra plugins e rotas. Motivo
// didático (ARQUITETURA.md §2.3): o wire-up é explícito aqui, sem mágica de
// decorators — dá pra ler de cima a baixo quem depende de quem.

import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { getPrismaClient } from './shared/prisma';
import { HttpError } from './shared/errors';
import { buildOrderingModule } from './modules/ordering/ordering.module';
import { registerOrderingRoutes } from './modules/ordering/http/ordering.routes';

export async function buildApp() {
  const app = Fastify({ logger: true });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, { origin: true });

  // Error handler global — formato padrão do Fastify: { statusCode, error, message }.
  // HttpError vem dos use cases (404, 400, ...); qualquer outra exceção vira 500.
  app.setErrorHandler((error: Error & { statusCode?: number }, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof HttpError) {
      reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      });
      return;
    }

    // Erros de validação do zod (querystring/params/body) já chegam com statusCode 400.
    const statusCode = error.statusCode ?? 500;
    if (statusCode >= 500) {
      app.log.error(error);
    }
    reply.status(statusCode).send({
      statusCode,
      error: statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
      message: statusCode === 500 ? 'Erro interno do servidor.' : error.message,
    });
  });

  const prisma = getPrismaClient();
  const ordering = buildOrderingModule(prisma);

  app.get('/api/health', async () => ({
    status: 'ok',
    database: ordering.usingDatabase ? 'postgres' : 'in-memory',
  }));

  registerOrderingRoutes(app, ordering);

  return app;
}
