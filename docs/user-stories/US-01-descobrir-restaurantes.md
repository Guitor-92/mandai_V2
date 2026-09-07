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

## Decisões

- **De onde vem "próximo":** distância é dado de seed, não geolocalização real
  — [DP-01](../decisoes-produto.md#dp-01--distância-vem-do-seed-não-de-geolocalização).
- **Bairro de retirada:** fixo em "Vila Madalena"; o *pickup pill* abre um
  popover informativo, não um modal de troca —
  [DP-02](../decisoes-produto.md#dp-02--bairro-de-retirada-fixo-em-vila-madalena).
- **"Mais pedidos no bairro":** mostra restaurantes (ordenados por
  `reviewCount`), não pratos —
  [DP-03](../decisoes-produto.md#dp-03--mais-pedidos-no-bairro-mostra-restaurantes).

## Critérios de aceite

- Ao abrir a Home, vejo o hero, os dois CTAs, os 8 tiles de categoria, o
  banner do cupom e as duas seções de restaurante ("Pertinho de você" e "Mais
  pedidos no bairro"), todas com dado de verdade vindo da API.
- Os restaurantes de "Pertinho de você" aparecem ordenados do mais perto pro
  mais longe.
- Os restaurantes de "Mais pedidos no bairro" aparecem ordenados do mais
  avaliado pro menos avaliado, e não se repetem com a seção acima só por
  coincidência de dado — cada seção tem seu próprio critério.
- O *pickup pill* sempre mostra "Vila Madalena"; clicar nele abre o popover
  com a copy de DP-02 e o botão "Entendi" fecha sem navegar pra lugar nenhum.
- Clicar num card de restaurante leva ao cardápio dele (US-04).
- Se a lista de restaurantes vier vazia da API, a seção mostra o estado vazio
  em vez de sumir ou quebrar a página.
- Se a API falhar ao carregar, a Home mostra o tratamento inline de
  [DP-19](../decisoes-produto.md#dp-19--alcance-da-tela-de-erro-10) em vez da
  tela cheia de erro.
