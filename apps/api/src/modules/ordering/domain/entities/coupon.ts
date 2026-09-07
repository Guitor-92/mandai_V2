// Cupom de desconto. Percentual OU valor fixo — nunca os dois. Zero imports
// de Fastify/Prisma.

export interface Coupon {
  code: string;
  label: string;
  percentOff: number | null;
  amountOffCents: number | null;
  minSubtotal: number;
  expiresAt: Date;
  active: boolean;
}
