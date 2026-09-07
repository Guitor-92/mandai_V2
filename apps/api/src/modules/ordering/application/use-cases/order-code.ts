import { randomInt } from 'node:crypto';

// Alfabeto sem caracteres ambíguos: nada de 0/O, 1/I. Ver docs/erd.md
// (Order.code) e CLAUDE.md.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateOrderCode(): string {
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `MA-${suffix}`;
}
