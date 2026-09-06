# US-01: Descobrir restaurantes

**Como** cliente, **quero** ver restaurantes próximos na Home, **para** escolher onde pedir.

- Referência visual: `01 · Home`
- Estados envolvidos: carregando (skeleton dos cards), populado, vazio (nenhum restaurante no bairro), erro de carregamento
- Entidades de domínio: `Restaurant`

## Contexto

A Home é a porta de entrada do Mandaí. Ela abre com o hero ("A comida boa do
bairro pronta quando você chega"), reforça as três promessas do produto — sem
taxa de entrega, código no balcão, pagamento no local — e desce para as listas
de descoberta.

O bairro de retirada aparece no *pickup pill* do header e é o recorte de tudo
que a Home mostra ("Em Vila Madalena · ordenado por distância"). Ele fica
guardado no navegador, com padrão "Vila Madalena".

## O que entra

- Hero com a proposta de valor e os dois CTAs ("Pedir agora", "Como funciona").
- Grade de 8 tiles de categoria (só a exibição; o clique é a US-02).
- Faixa promocional com o banner do cupom `MANDA20` e os dois cards de apoio
  (o uso do cupom em si é a US-07).
- Seção "Pertinho de você": grade de 6 cards de restaurante ordenada por
  distância.
- Seção "Mais pedidos no bairro": mais 3 cards.
- Card de restaurante com capa, nome, tags, nota, contagem de avaliações,
  distância, tempo de preparo e selo de promoção quando houver.
- Clique no card leva para o cardápio (US-04).

## O que NÃO entra

- Filtro por categoria (US-02) e busca por texto (US-03).
- Modal de troca de bairro/endereço no *pickup pill* — o handoff diz
  explicitamente que essa tela não foi desenhada.
- Recomendação personalizada, histórico ou favoritos (dependem de cadastro,
  que está fora do MVP).

## [DECISÃO PENDENTE]

- **De onde vem "próximo".** O handoff propõe
  `GET /api/restaurants?lat&lng&radius` (geolocalização real), mas o
  `ARQUITETURA.md` §2.4 define `GET /api/restaurants` com filtro `?category=`,
  e o ERD guarda `Restaurant.distanceMeters` como um número fixo por
  restaurante. Para o MVP didático, decidir se distância é dado de seed
  (mais simples) ou cálculo por coordenadas.
- **Bairro de retirada.** Está fixo em "Vila Madalena" no armazenamento local
  e não há tela para trocá-lo. Definir se o MVP mantém o valor fixo ou se o
  modal simples de troca entra no escopo.
- **"Mais pedidos no bairro".** O título fala de pratos, mas o design renderiza
  cards de restaurante. Confirmar qual das duas leituras vale.
