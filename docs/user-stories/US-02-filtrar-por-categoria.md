# US-02: Filtrar por categoria

**Como** cliente, **quero** filtrar restaurantes por tipo de cozinha, **para** encontrar o que estou afim.

- Referência visual: `01 · Home` (grade de 8 tiles de categoria) → `02 · Categoria`
- Estados envolvidos: carregando, populado, vazio (categoria sem restaurante no bairro), filtro por chip aplicado
- Entidades de domínio: `Restaurant` (campo `category`)

## Contexto

Clicar num tile da Home ("Pizza", por exemplo) abre a página da categoria, que
é a mesma lista da Home com um recorte: breadcrumb `Início › Pizza`, título
"Pizza pertinho de você", contagem ("32 restaurantes em Vila Madalena") e uma
grade de 3 colunas.

Categoria não é tabela: o ERD guarda `Restaurant.category` como slug de texto,
e emoji + cor de fundo dos 8 tiles são constantes do frontend.

## O que entra

- Rota por categoria (`/categoria/[slug]`) alimentando a lista filtrada.
- Breadcrumb, título, contagem de resultados e bairro.
- Grade de 3 colunas com o mesmo card de restaurante da Home.
- Banner promocional da categoria.
- Chips de sub-filtro funcionais: "Todos", "Aberto agora", "Avaliação 4,5+" e
  "Pronto em 20 min".

## O que NÃO entra

- Busca por texto (US-03).
- Cadastro/edição de categorias — são constantes de frontend no MVP.
- Chips sem respaldo no modelo ("Retirada grátis", "Promoções", "R$ até 50",
  "Forno a lenha") e qualquer ordenação além de distância.
- Botão "Carregar mais" / paginação —
  [DP-23](../decisoes-produto.md#dp-23--carregar-mais-sai-do-mvp).

## Decisões

- **Chips de sub-filtro:** só os quatro com respaldo no ERD entram; os demais
  saem da tela —
  [DP-04](../decisoes-produto.md#dp-04--chips-de-sub-filtro-da-categoria).
- **Ordenação:** um critério só, distância —
  [DP-05](../decisoes-produto.md#dp-05--ordenação-da-categoria-só-por-distância).
- **`GET /api/categories`:** não existe no MVP — resolvido no briefing do lead
  (`docs/qa/00-briefing-do-lead.md`, seção C). Categoria segue como constante
  de frontend.
- **"Carregar mais":** sai do MVP —
  [DP-23](../decisoes-produto.md#dp-23--carregar-mais-sai-do-mvp).

## Critérios de aceite

- Clicar num tile de categoria na Home leva a `/categoria/[slug]` com
  breadcrumb, título, contagem de restaurantes e bairro corretos.
- A grade mostra só restaurantes daquela categoria, em 3 colunas, ordenados
  por distância.
- Os quatro chips de DP-04 filtram a lista corretamente quando clicados; os
  chips fora de escopo não aparecem na tela.
- Não existe botão "Carregar mais" em lugar nenhum da tela.
- Categoria sem nenhum restaurante no bairro mostra o estado vazio, não uma
  grade em branco.
