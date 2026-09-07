import { apiFetch } from "@/shared/lib/api";
import type { CouponValidation } from "@/shared/types";

// US-07 (opcional no MVP): valida no servidor — existe, está ativo, não expirou
// e o subtotal atinge o mínimo. Em caso de erro, o servidor responde com o
// formato padrão { statusCode, error, message } (ApiError) — não um campo
// `valid: false`. Quem chama trata a rejeição no catch.
export function validateCoupon(code: string, subtotalCents: number): Promise<CouponValidation> {
  return apiFetch<CouponValidation>("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotalCents }),
  });
}
