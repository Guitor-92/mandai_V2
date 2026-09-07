# Respostas do PO

Perguntas de negócio feitas pelos outros agentes do time (`backend-agent`,
`frontend-agent`, `architect-agent`) durante a release 0.1.0, e as respostas
do `product-owner-agent`. Cada resposta é definitiva até que um novo pedido
de esclarecimento a substitua — e, quando substituir uma decisão já registrada
em `docs/decisoes-produto.md`, a entrada de lá é atualizada também.

Formato: `### P-NN · <pergunta>` seguido de `**Resposta:**`.

---

### P-01 · O que exatamente a tela de confirmação (`06`) precisa mostrar, campo a campo?

**Resposta:**

A rota é `/pedido/[codigo]`, lendo `GET /api/orders/:code`
(`docs/qa/00-briefing-do-lead.md`, seção B). Campo a campo, usando os nomes do
`docs/erd.md`:

| Elemento da tela | Campo/fonte |
|---|---|
| Título "Pedido confirmado" | fixo |
| Chamada com o nome | `Order.customerName` — "Pode vir buscar, {customerName}!" |
| QR code (208×208, moldura branca 12px) | gerado a partir de `Order.qrPayload` (ver [DP-16](../decisoes-produto.md#dp-16--qr-sem-assinatura-real) — sem assinatura real no MVP), com `aria-label="QR code do pedido {code}"` |
| Código alfanumérico grande, copiável | `Order.code` (`MA-XXXX`) |
| Botão "Copiar código" | clipboard API sobre `Order.code` |
| Botão "Baixar QR" | exporta o QR renderizado como PNG |
| Botão "Compartilhar por WhatsApp" | `wa.me/?text=` com `Order.code` e o nome do restaurante pré-formatados |
| Tempo previsto | `Order.estimatedReadyAt` (formatado como "Pronto em ~X min", calculado no servidor como `createdAt + prepTimeMinutes`) |
| Ficha do restaurante | `Restaurant.name`, `logoUrl`, `addressLine`, `phone` (telefone é só exibição, sem botão funcional de ligar — ver US-04) |
| Recibo | cada `OrderItem` com `nameSnapshot`, `modifiers` (congelado), `note`, `qty`, `lineTotalCents`; depois `Order.subtotalCents`, a linha de cupom se `Order.couponCode` não for nulo (rótulo + `Order.discountCents`), "Taxa de retirada — Grátis" e `Order.totalCents` como "Total a pagar no balcão" |
| Passo a passo da retirada | texto fixo em 4 etapas, não vem de dado nenhum |

Antes desta tela existir, o formulário (mesma rota visual, estado `FORM`)
coleta só `customerName`, com a validação de
[DP-24](../decisoes-produto.md#dp-24--nome-do-cliente-obrigatório-no-checkout).
Ao confirmar, `POST /api/orders` cria o pedido e o front navega para
`/pedido/[codigo]` já no estado `DONE`.

---

### P-02 · Qual o comportamento quando o restaurante está fechado e a pessoa tenta adicionar item ou finalizar?

**Resposta:**

**Tentando adicionar um item** (`Restaurant.isOpen === false`): o cardápio
carrega normalmente, mas fica **só leitura** — nenhum prato tem `+` clicável
nem abre o modal de customização (US-05 não roda para restaurante fechado).
A tela mostra o banner "Fechado agora. A {Restaurante} abre {próxima
abertura}." com o botão "Me avisa quando abrir" (que vira toast, ver
[DP-17](../decisoes-produto.md#dp-17--me-avisa-quando-abrirvoltar), sem
coletar contato), a grade semanal de horários
([DP-18](../decisoes-produto.md#dp-18--openinghour-continua-como-tabela)) e
uma lista de restaurantes abertos por perto. Isso é bloqueio de UI: o botão
nem existe pra ser clicado.

**Tentando finalizar** (`POST /api/orders`): mesmo que a UI tenha permitido
chegar até aqui — por exemplo, a sacola já tinha itens de quando o
restaurante ainda estava aberto, e ele fechou enquanto a pessoa demorava no
checkout — o servidor **sempre revalida** `Restaurant.isOpen` antes de criar
o pedido (`docs/qa/00-briefing-do-lead.md`, seção C: "restaurante aberto").
Se fechado, a API responde com erro (`400`, formato padrão do Fastify) e o
frontend mostra:

> A {Restaurante} fechou enquanto você decidia. Sua sacola tá salva — dá uma
> olhada em outro lugar aberto.

com um botão voltando pra Home ou pra sacola. A sacola **não é esvaziada**
nesse caso — só um pedido confirmado com sucesso esvazia a sacola (US-08).

Isso não é a tela `10 · Erro` (essa é reservada para falha técnica de envio,
ver [DP-19](../decisoes-produto.md#dp-19--alcance-da-tela-de-erro-10)) — é uma
mensagem de regra de negócio, tratada inline no formulário/sacola.

---

### P-03 · Qual o comportamento de um item `OUT_OF_STOCK` e de um `LOW_STOCK` no cardápio, no modal e na sacola?

**Resposta:**

`MenuItem.availability` tem três valores (ver `docs/erd.md`), sempre editado
manualmente no cadastro/seed —
[DP-20](../decisoes-produto.md#dp-20--últimas-unidades-é-rótulo-manual):

**`AVAILABLE`** — comportamento padrão, sem nenhum selo. `+` funcional, abre o
modal normalmente.

**`LOW_STOCK`** ("Últimas unidades"):
- *Cardápio:* selo âmbar "Últimas unidades" sobre a foto do prato. O `+`
  continua funcional.
- *Modal:* abre normalmente, sem nenhuma mensagem especial dentro dele — o
  selo já avisou na listagem.
- *Sacola:* se a pessoa já tinha adicionado e o prato virou `LOW_STOCK`
  depois, nada muda na sacola — ela é congelada por linha (`nameSnapshot`
  etc.) e só é revalidada de fato em `POST /api/orders`. Não há aviso
  reativo na sacola por mudança de estoque.

**`OUT_OF_STOCK`** ("Esgotado"):
- *Cardápio:* card em cinza (dessaturado), sem `+` funcional. Clicar no card
  abre um **modal explicativo** (diferente do modal de customização da
  US-05): explica que o prato acabou naquela casa, com o botão "Me avisa
  quando voltar" (vira toast, DP-17, sem coletar contato).
- *Modal de customização:* nunca abre para um item `OUT_OF_STOCK` — é
  interceptado no clique do cardápio, como acima.
- *Sacola:* se o prato já estava numa linha da sacola antes de esgotar, a
  linha continua visível normalmente (mesma lógica de congelamento do
  `LOW_STOCK`) — mas `POST /api/orders` rejeita a linha na revalidação, e o
  frontend mostra qual item não está mais disponível, pedindo pra remover ou
  ajustar antes de tentar de novo. Isso é regra de negócio (US-08 "revalida
  no servidor"), não a tela `10`.

---

### P-04 · (architect-agent) O piso de acessibilidade do MVP já foi decidido, para registrar em ADR-0012?

**Resposta:**

Sim — [DP-26](../decisoes-produto.md#dp-26--piso-mínimo-de-acessibilidade)
fecha essa pendência. Resumo pro ADR:

**Entra** (inerente a implementar a funcionalidade direito, custo ~zero):
foco preso + Esc no modal de customização (já é requisito funcional da
US-05); `<label>` em todo campo de formulário (nome, cupom, busca,
observação); `aria-label` em botão *icon-only* (fechar modal, lixeira,
copiar código); `aria-label` no QR com o código por extenso + código em
texto como alternativa (já é requisito funcional da US-08); outline de foco
visível (já vem de `tokens.css`).

**Fica fora** (mesmo motivo do `ARQUITETURA.md` §11 — mentoria, não produto
sob obrigação de conformidade): auditoria WCAG AA/AAA formal; teste com
leitor de tela; `role="spinbutton"` no seletor de quantidade (um
`<input type="number">` nativo com botões +/- resolve sem o vocabulário ARIA
extra); navegação 100% por teclado testada ponta a ponta; testes
automatizados de a11y.

O ADR-0012 pode citar DP-26 diretamente. Se o architect-agent divergir em
algum ponto específico, o DP-26 é reaberto e ajustado — não deve nascer um
segundo critério de acessibilidade paralelo.
