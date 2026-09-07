# Pendências do frontend

Dúvidas e decisões tomadas durante a implementação de `apps/web`, seguindo as
suposições sob as quais segui em frente sem travar o trabalho (conforme
`docs/qa/00-briefing-do-lead.md`, seção "Como perguntar").

---

## Correções pós-auditoria do arquiteto (`docs/qa/conformidade-arquitetura.md`)

- **Hex hardcoded em `shared/constants.ts`.** As categorias "Açaí" e
  "Bebidas" usavam `#F6E9F2`/`#E0EEF0` direto (copiado do mock original, que
  também hardcodeava). Corrigido: cicla os três tons claros que já existem em
  `tokens.css` (`--tomate-50`, `--folha-50`, `--manga-50`) entre as 8
  categorias, sem valor novo. Também troquei todo `"#fff"` literal (herdado
  do JSX do handoff) por `var(--white)` nos componentes que eu tinha escrito
  até então — varredura confirmou zero hex solto em `src/`.
- **Merge de linha da sacola (`sameLine`).** Esse ponto já **não existe** no
  código — corrigi antes mesmo dessa auditoria rodar, assim que li DP-11 em
  `docs/decisoes-produto.md` (a decisão do PO saiu depois de eu ter escrito a
  primeira versão do `CartContext`, mas antes de eu montar as telas). A
  auditoria deve ter rodado numa janela em que o snapshot do disco ainda
  tinha a versão antiga. `addItemToCart` sempre cria linha nova
  (`crypto.randomUUID()` por linha); confirmei que `lineId` é estável no
  round-trip pelo `localStorage` (é gravado no objeto, não recalculado) e que
  remover uma linha (`REMOVE_LINE`) filtra só pelo `lineId`, sem afetar outras
  linhas do mesmo prato.

## Correções pós-decisões do PO (cópia literal, não a minha)

- **DP-14 (cupom).** Os três estados de erro do campo de cupom na sacola
  agora usam a copy exata do PO, não a mensagem crua do backend (que é
  genérica por decisão do ADR-0010): "Esse cupom não existe ou não vale mais
  por aqui.", "Esse cupom já venceu — mas sempre tem outro rolando." e
  "Faltam {R$ X} pro pedido chegar no mínimo de R$ 30,00 desse cupom." (o
  valor que falta é calculado no cliente a partir da mensagem do servidor).
  Ver `src/modules/cart/hooks/useCoupon.ts`.
- **P-02 (restaurante fechou durante o checkout).** `POST /api/orders`
  revalida `isOpen` e devolve 400 com uma mensagem genérica; na tela de
  checkout eu troco por "{Restaurante} fechou enquanto você decidia. Sua
  sacola tá salva — dá uma olhada em outro lugar aberto.", com os botões
  "Voltar pra Home" e "Voltar pra sacola" (a sacola não é esvaziada). Ver
  `src/modules/orders/components/CheckoutFlow.tsx`. As demais mensagens de
  erro de negócio (item esgotado, grupo obrigatório, etc.) continuam sendo a
  mensagem crua do servidor — o próprio `docs/qa/contrato-api.md` as descreve
  como "prontas pra mostrar na UI", diferente do cupom e do restaurante
  fechado, que têm copy própria do PO.

---

## Q-01 · `Order` não trazia dado do restaurante

**Pergunta enviada ao `backend-agent`:** `toOrderDTO()` devolvia só
`restaurantId` (cuid interno). A tela `/pedido/[codigo]` (P-01 em
`docs/qa/respostas-po.md`) precisa de nome/endereço/telefone/logo do
restaurante, e não existe endpoint público por `id`.

**Resposta:** o `backend-agent` adicionou `restaurant` (ficha resumida:
`slug, name, addressLine, neighborhood, city, phone, coverUrl, logoUrl`)
embutido em `GET/POST /api/orders`, documentado em
`docs/qa/contrato-api.md`. Consumido em
`src/modules/orders/components/OrderConfirmationView.tsx`. Resolvido.

## Q-02 · Nome do campo `priceDelta` em `OrderItem.modifiers`

Notei que o código inicial usava `priceDeltaCents` (divergindo do
`docs/erd.md`, que registra `priceDelta`). O `backend-agent` corrigiu para
`priceDelta` — `shared/types.ts` usa esse nome para
`OrderItemModifierSnapshot` (o lado do cardápio, `ModifierOption`, continua
`priceDeltaCents`, que é outro tipo). Resolvido.

## Q-03 · Regra da tela de erro (10) vs. erro de negócio inline (P-02)

`POST /api/orders` não distingue tipos de erro por código semântico (decisão
consciente do `architect-agent`, ver ADR-0010 "alternativas consideradas") —
só `{ statusCode, error, message }`. Para separar "restaurante fechou" (regra
de negócio, mensagem inline, sacola preservada) da falha técnica (tela 10,
DP-19), assumi a heurística: **`statusCode < 500` → mensagem inline com o
`message` do servidor; `>= 500` ou falha de rede → tela cheia de erro**. Isso
bate com o desenho do contrato (400 sempre carrega uma frase pronta pra UI,
conforme a tabela em `docs/qa/contrato-api.md`). Ver
`src/modules/orders/components/CheckoutFlow.tsx`.

## Q-04 · Identidade da linha ao editar item da sacola

`docs/decisoes-produto.md` (DP-11) fechou que cada "Adicionar à sacola" cria
uma linha nova, nunca funde. Para "Editar item" (US-06 reabrindo o modal da
US-05), assumi que editar **substitui os dados da mesma linha** (mesmo
`lineId`), sem virar uma segunda linha — é a leitura mais direta de "editar".
Implementado buscando o cardápio do restaurante (`GET /api/restaurants/:slug`,
já cacheado via TanStack Query) para reconstruir o `MenuItem` original e abrir
o mesmo `AddItemModal` pré-populado. Ver `src/modules/cart/components/CartView.tsx`.

## Q-05 · Item "quick add" na busca (11) sem passar pelo modal

A tela de busca do handoff mostra um botão "Adicionar" direto no card do
prato, sem modal. Isso conflita com US-05 ("nunca confiar que uma escolha
obrigatória foi feita"). Assumi: se o prato **não tem nenhum** `modifierGroup`,
"Adicionar" soma direto à sacola (qty 1, sem modificadores); se tem qualquer
grupo, o botão vira "Escolher" e leva para `/restaurante/:slug?item=:id` (abre
o modal de verdade). Ver `src/modules/search/components/SearchResultsView.tsx`.

## Q-06 · Chip "Retirada grátis" no card de restaurante

O card do handoff (`shared.jsx`) tem um badge de promo por restaurante
(`r.promo`), mas nenhum campo do ERD/API sustenta isso (`Restaurant` não tem
`promoLabel`). Removi o badge de promo do `RestaurantCard` — mantive só a
linha de meta "Retirada grátis" (fixa, é sempre grátis no Mandaí) e adicionei
um badge "Fechado agora" quando `isOpen: false`, que é dado real. `MenuItem`
continua com `promoLabel` (esse sim existe na API) e aparece no cardápio.

## Q-07 · Bug de plataforma: `notFound()` não seta status HTTP 404

Verificado e isolado (não é bug do meu código): em `next start` com esta
instalação de **Next.js 15.5.25**, uma página que chama `notFound()` — mesmo
o caso mínimo possível, sem fetch nenhum — renderiza o conteúdo de
`not-found.tsx` corretamente, mas a resposta HTTP vem com **status 200** em
vez de 404. Reproduzi isolando num route de teste descartável
(`app/test-nf/page.tsx`, removido depois do teste) com `notFound()` puro:
mesmo resultado. `curl` e `node --eval "fetch(...)"` confirmam os mesmos
200; rotas realmente inexistentes (sem `notFound()` programático) retornam
404 normalmente.

**Impacto:** nenhum no conteúdo exibido ao usuário (`/restaurante/[slug]` e
`/pedido/[codigo]` mostram a mensagem certa para slug/código inexistente) —
só o código HTTP fica incorreto para bots/SEO/monitoramento. Não bloqueia a
verificação funcional do `ARQUITETURA.md` §10.

**Sugestão pro `architect-agent`:** investigar se é uma regressão conhecida
desta versão patch específica (`AGENTS.md` gerado pelo próprio `next dev`
avisa "This version has breaking changes... may differ from your training
data") — testar outra patch da série 15.5.x, ou registrar como risco aceito
em ADR se persistir.

## Q-08 · Filtros de preço/distância da busca (US-03)

DP-06 já cortou faixa de preço e slider de distância do painel de refino
(sem campo no modelo). Implementei "Aberto agora" e "Tempo de preparo" como
filtros **client-side** sobre o resultado já carregado, sem refetch — como o
DP pede.

## Q-09 · "Ordenar: Distância" nas telas 02/03

Mantive o controle visual do hi-fi (dropdown de ordenação com uma opção só,
DP-05), mas ele não abre menu nenhum — é decorativo/fiel ao design, já que
não há segundo critério de ordenação especificado.

---

Nenhuma pendência acima bloqueou a implementação; todas seguiram com a
suposição documentada.
