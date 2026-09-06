# US-02: Filtrar por categoria

**Como** cliente, **quero** filtrar restaurantes por tipo de cozinha, **para** encontrar o que estou afim.

- Referência visual: `01 · Home` (grade de 8 tiles de categoria) → `02 · Categoria`
- Estados envolvidos: carregando, populado, vazio (categoria sem restaurante no bairro), "carregar mais" (paginação)
- Entidades de domínio: `Restaurant` (campo `category`)

## Contexto

Clicar num tile da Home ("Pizza", por exemplo) abre a página da categoria, que
é a mesma lista da Home com um recorte: breadcrumb `Início › Pizza`, título
"Pizza pertinho de você", contagem ("32 restaurantes em Vila Madalena") e uma
grade de 3 colunas.

Categoria não é tabela: o ERD guarda `Restaurant.category` como slug de texto,
e emoji + cor de fundo dos 8 tiles são constantes do frontend.

## O que entra

- Rota por categoria (`/categoria/:slug`) alimentando a lista filtrada.
- Breadcrumb, título, contagem de resultados e bairro.
- Grade de 3 colunas com o mesmo card de restaurante da Home.
- Banner promocional da categoria.
- Botão "Carregar mais" ao pé da lista.

## O que NÃO entra

- Busca por texto (US-03).
- Cadastro/edição de categorias — são constantes de frontend no MVP.
- Ordenação e filtros avançados que não têm campo no modelo (ver pendências).

## [DECISÃO PENDENTE]

- **Chips de sub-filtro.** A tela desenha oito: "Todos", "Aberto agora",
  "Retirada grátis", "Avaliação 4,5+", "Promoções", "Pronto em 20 min",
  "R$ até 50" e "Forno a lenha". Só três têm respaldo no ERD
  (`isOpen`, `rating`, `prepTimeMinutes`). "Retirada grátis" é redundante — a
  retirada é sempre grátis no Mandaí. Faixa de preço e "Forno a lenha" não
  existem no modelo. Decidir quais chips entram no MVP e quais viram enfeite
  desabilitado.
- **Ordenação.** O botão "Ordenar: Distância" sugere mais de um critério, mas
  nenhum outro está desenhado.
- **`GET /api/categories`.** O handoff prevê o endpoint; o ERD diz que
  categoria é constante de frontend enquanto não precisar ser dinâmica.
  Confirmar que o MVP não expõe esse endpoint.
