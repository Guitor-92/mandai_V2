// HttpError — usado pelos use cases para sinalizar erros de negócio (404, 400).
// Sem Result pattern (ARQUITETURA.md §8): os use cases lançam, o error handler
// global do Fastify (ver app.ts) converte pra resposta HTTP no formato padrão
// do Fastify: { statusCode, error, message } (docs/qa/00-briefing-do-lead.md).

const REASON_PHRASES: Record<number, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
};

export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = REASON_PHRASES[statusCode] ?? 'Error';
  }
}
