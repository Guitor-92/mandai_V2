# US-03: Buscar

**Como** cliente, **quero** buscar por nome de restaurante ou prato, **para** localizar rapidamente.

- Referência visual: `11 · Busca — resultados`, `11b · Busca — sem resultados`; campo de busca no header (todas as telas)
- Estados envolvidos: digitando, carregando, resultados (mistos), sem resultados, erro
- Entidades de domínio: `Restaurant`, `MenuItem`, `MenuSection`

## Contexto

A busca vive no header e acompanha o cliente por todas as telas. Enter leva
para `/busca?q=<termo>`. O resultado é **misto**: uma coluna de restaurantes e
uma de pratos, cada prato mostrando a que restaurante pertence e o preço. O
trecho digitado aparece destacado em amarelo dentro do nome encontrado.

À direita há um painel de refino (aberto agora, tempo de preparo, faixa de
preço, distância). Quando nada casa, a tela `11b` assume: repete o termo
buscado, oferece sugestões próximas, buscas recentes, categorias e o convite
"Indica um restaurante".

## O que entra

- Campo de busca no header submetendo com Enter.
- Página de resultados com as duas listas (restaurantes e pratos) e a contagem.
- Destaque do termo dentro dos nomes encontrados.
- Estado sem resultados com sugestões, recentes e categorias.
- Clique em qualquer resultado leva ao cardápio do restaurante (US-04).

## O que NÃO entra

- Autocomplete/sugestão enquanto digita — não está desenhado.
- Correção ortográfica ou busca semântica.
- "Indica um restaurante" como fluxo funcional — o link fica na tela, mas só
  mostra um toast ao clicar,
  [DP-22](../decisoes-produto.md#dp-22--indica-um-restaurante-sai-do-mvp-funcional).
- Histórico persistido de buscas por pessoa no servidor — não há cadastro no
  MVP; buscas recentes ficam só no navegador (DP-07 abaixo).
- Filtro por faixa de preço ou distância em km — sem campo no modelo.

## Decisões

- **Contrato do endpoint:** `GET /api/search?q=` devolvendo
  `{ restaurants, items }` — resolvido no briefing do lead
  (`docs/qa/00-briefing-do-lead.md`, seção C).
- **Filtros laterais:** client-side, só com "Aberto agora" e "Pronto em X
  min" —
  [DP-06](../decisoes-produto.md#dp-06--filtros-da-busca-ficam-client-side).
- **Buscas recentes:** entram, guardadas em localStorage —
  [DP-07](../decisoes-produto.md#dp-07--buscas-recentes-no-navegador).
- **"Indica um restaurante":** sai do MVP funcional, vira toast —
  [DP-22](../decisoes-produto.md#dp-22--indica-um-restaurante-sai-do-mvp-funcional).

## Critérios de aceite

- Digitar um termo no campo de busca do header e apertar Enter navega para
  `/busca?q=<termo>`.
- A página de resultados mostra a contagem, a coluna de restaurantes e a
  coluna de pratos (cada prato com o nome do restaurante e o preço), com o
  termo buscado destacado em amarelo dentro dos nomes encontrados.
- Os filtros "Aberto agora" e "Pronto em X min" refinam a lista já carregada,
  sem gerar uma nova chamada à API.
- Buscar sem nenhum resultado leva à tela `11b`, com o termo repetido,
  sugestões, categorias e os chips de busca recente (se houver alguma
  guardada neste navegador).
- Clicar em "Indica um restaurante" mostra o toast de DP-22 e não navega nem
  abre formulário nenhum.
- Clicar em qualquer resultado (restaurante ou prato) leva ao cardápio do
  restaurante correspondente.
