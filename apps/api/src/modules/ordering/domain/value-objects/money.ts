// VO didático: dinheiro sempre em centavos inteiros. Nunca float.
// ARQUITETURA.md §2.2 — "VO Money (valida valor >= 0, formata BRL)".

export class Money {
  private readonly cents: number;

  constructor(cents: number) {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new Error(`Money: valor deve ser um inteiro em centavos >= 0 (recebido: ${cents}).`);
    }
    this.cents = cents;
  }

  static zero(): Money {
    return new Money(0);
  }

  get value(): number {
    return this.cents;
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    return new Money(Math.max(0, this.cents - other.cents));
  }

  multiply(qty: number): Money {
    return new Money(this.cents * qty);
  }

  format(): string {
    return (this.cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
