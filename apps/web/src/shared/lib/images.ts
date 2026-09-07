// Helper decorativo — mesmas fotos de Unsplash do handoff, usadas só na Home
// (as fotos dos restaurantes/pratos, essas sim, vêm da API).
export function unsplash(id: string, w = 800): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
}
