# ADR-0015: Cupom (US-07) e troca de restaurante (US-10) confirmados no escopo firme do MVP

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

`ARQUITETURA.md` §6.3 marca US-07 (cupom) e US-10 (troca de restaurante com sacola)
como *opcionais* — escopo que poderia ser cortado sem quebrar o produto. O ADR-0010
(Superfície da API v0.1.0), escrito antes de o `product-owner-agent` decidir os
detalhes de UX das duas histórias, já havia antecipado `POST /api/coupons/validate` na
superfície da API, mas com essa mesma reserva: a decisão descreve o endpoint como
"implementado apesar de opcional" e, nas Consequências, chega a nomeá-lo "o primeiro
candidato a cortar sem quebrar o fluxo principal".

O `product-owner-agent` fechou as duas histórias depois, com regras completas:

- [DP-14](../decisoes-produto.md#dp-14--cupom-entra-no-mvp) — cupom **entra** no MVP,
  com seed único (`MANDA20`, 20% off, pedido mínimo R$ 30,00), o endpoint
  `POST /api/coupons/validate { code, subtotalCents } → { valid, discountCents, label, message }`,
  a regra de que `validate` é preview e `POST /api/orders` recalcula do zero, e copy
  definida para cada estado (válido, inexistente, expirado, abaixo do mínimo).
- [DP-21](../decisoes-produto.md#dp-21--troca-de-restaurante-com-sacola-entra-no-mvp) —
  troca de restaurante com sacola não vazia **entra** no MVP, com diálogo de
  confirmação disparado no clique que abriria o modal de customização de item de outro
  restaurante (não dentro do modal, para não desperdiçar esforço de customização se a
  resposta for cancelar), copy e comportamento definidos, sem "desfazer".

Isso muda o status das duas histórias de "nice-to-have, cortável sob pressão de tempo"
para "escopo comprometido, tão obrigatório quanto qualquer outra US do MVP". A
formulação de ADR-0010 — escrita quando isso ainda era incerto — ficou desatualizada
num ponto que importa de verdade: alguém sob pressão de prazo, lendo só o ADR-0010,
poderia decidir cortar `POST /api/coupons/validate` achando que tem essa liberdade. Não
tem mais.

Como ADRs aceitos são imutáveis (`docs/adr/README.md`), este ADR não edita o ADR-0010
— ele registra a decisão do PO que fecha a ambiguidade e atualiza a leitura corrente.

## Decisão

**US-07 (cupom) e US-10 (troca de restaurante) são escopo firme da release 0.1.0**, no
mesmo nível de obrigatoriedade que qualquer outra US listada em `docs/user-stories/`.
Nenhuma delas é candidata a corte por pressão de tempo sem uma decisão explícita nova
do PO ou do lead revertendo DP-14/DP-21.

Consequência direta sobre a leitura do ADR-0010: o trecho "Cupom implementado apesar de
opcional (US-07) é escopo a mais que o MVP estritamente exige. Se o tempo apertar,
`POST /api/coupons/validate` é o primeiro candidato a cortar sem quebrar o fluxo
principal" (seção Consequências do ADR-0010) está **superado por este ADR** nesse ponto
específico — o restante do ADR-0010 (os sete endpoints, o formato de erro, centavos
inteiros, revalidação total) permanece integralmente válido.

Nada muda na arquitetura por causa disso — `POST /api/coupons/validate` já estava
correto na superfície da API (ADR-0010), e a troca de restaurante já era prevista como
responsabilidade do `CartContext` no frontend (ADR-0003). O que muda é só a
obrigatoriedade: as duas deixam de ser as primeiras a sair do escopo se o cronograma
apertar.

## Consequências

A equipe de backend e frontend não pode tratar cupom ou troca de restaurante como
trabalho "de sobra" — as duas entram na verificação end-to-end da release
(`ARQUITETURA.md` §10) com o mesmo peso de US-01 a US-06 e US-08.

Isso remove uma ambiguidade real: sem este ADR, alguém sob pressão de prazo que lesse
só o ADR-0010 (não `docs/decisoes-produto.md`) tomaria uma decisão de corte que o PO já
havia revertido — o tipo de dessincronia entre documentos que o ADR-0007 existe para
evitar.

Custo assumido: o MVP fica com duas histórias a mais de superfície obrigatória do que
o `ARQUITETURA.md` original previa — mais um fluxo de erro de cupom (código inexistente,
expirado, abaixo do mínimo) e mais um diálogo de confirmação com estado (`pendingConflict`
no `CartContext`, já implementado) para escrever e testar manualmente antes da entrega.
Nenhuma das duas exige conceito arquitetural novo — ambas usam as camadas e padrões já
decididos (ADR-0002, ADR-0003, ADR-0010) — então o custo é de tempo de implementação e
teste manual, não de complexidade de design.

## Alternativas consideradas

**Editar o ADR-0010 diretamente**, removendo a menção a "opcional" e "candidato a
cortar". Descartado pela regra de imutabilidade de ADRs (`docs/adr/README.md`): um ADR
aceito registra o raciocínio *da época* em que foi escrito, incluindo incertezas que
existiam então. Apagar essa incerteza reescreveria a história em vez de documentar que
ela foi resolvida depois — exatamente o motivo pelo qual a regra de superseding existe.

**Não fazer nada, e confiar em `docs/decisoes-produto.md` como única fonte de
verdade sobre o que é opcional.** Deixaria a informação correta disponível, só não no
lugar que alguém consultando `docs/adr/` esperaria encontrá-la. Descartado porque o
ADR-0010 é especificamente o documento que qualquer pessoa lendo "o que a API precisa
entregar" vai abrir primeiro — deixar uma afirmação factualmente superada lá, sem
apontamento para a correção, é o cenário exato que motivou o lead a pedir este registro.

**Criar um ADR só para US-07 e outro só para US-10.** Manteria uma decisão por
arquivo, no espírito de "um ADR por decisão". Descartado porque as duas mudanças têm a
mesma forma exata (uma US marcada opcional em `ARQUITETURA.md` §6.3 e revertida por
decisão do PO) e a mesma consequência técnica (atualizar a leitura do ADR-0010) —
tratá-las juntas evita repetir o mesmo contexto duas vezes para uma decisão que, na
prática, é uma só: "o `ARQUITETURA.md` original estava desatualizado quanto a que é
opcional, e agora não está mais".
