# US-03: Buscar

**Como** cliente, **quero** buscar por nome de restaurante ou prato, **para** localizar rapidamente.

- Referência visual: `11 · Busca — resultados`, `11b · Busca — sem resultados`; campo de busca no header (todas as telas)
- Estados envolvidos: digitando, carregando, resultados (mistos), sem resultados, erro
- Entidades de domínio: `Restaurant`, `MenuItem`, `MenuSection`

## Contexto

A busca vive no header e acompanha o cliente por todas as telas. Enter leva
para `/buscar?q=<termo>`. O resultado é **misto**: uma coluna de restaurantes e
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
- "Indica um restaurante" como fluxo funcional (o botão existe, o destino não).
- Histórico persistido de buscas por pessoa — não há cadastro no MVP.

## [DECISÃO PENDENTE]

- **Contrato do endpoint.** O handoff propõe
  `POST /api/search { q, lat, lng }` devolvendo `{ restaurants, dishes }`; o
  `ARQUITETURA.md` §2.4 define `GET /api/search?q=`. Escolher um.
- **Filtros laterais.** Faixa de preço (`R$` / `R$R$` / `R$R$R$`) e o slider de
  distância em km não têm campo correspondente no ERD. O handoff também diz que
  os filtros podem ser client-side ou refetch — definir qual no MVP.
- **Buscas recentes.** A tela `11b` mostra chips de "recentes"; sem cadastro,
  isso teria que morar no navegador. Confirmar se entra.
