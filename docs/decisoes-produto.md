# Decisões de produto — Mandaí

Registro das decisões de produto do time, tomadas para destravar o trabalho
paralelo de `apps/api` e `apps/web` na release 0.1.0. Complementa as âncoras de
coordenação de `docs/qa/00-briefing-do-lead.md` (que já resolveu identificador
de restaurante, rotas e contrato de endpoints — não repetido aqui) e substitui
os blocos `[DECISÃO PENDENTE]` espalhados por `docs/user-stories/`.

Data de todas as decisões abaixo: **2026-09-06**.

Convenção: cada decisão tem **Contexto** (o que estava em aberto e por quê),
**Decisão** (a resposta, sem "depende") e **Impacto nas US** (quem precisa
saber disso pra implementar).

---

## Índice

| ID | Decisão | US afetada |
|---|---|---|
| [DP-01](#dp-01--distância-vem-do-seed-não-de-geolocalização) | Distância vem do seed, não de geolocalização | US-01, US-02 |
| [DP-02](#dp-02--bairro-de-retirada-fixo-em-vila-madalena) | Bairro de retirada fixo em "Vila Madalena" | US-01 |
| [DP-03](#dp-03--mais-pedidos-no-bairro-mostra-restaurantes) | "Mais pedidos no bairro" mostra restaurantes, não pratos | US-01 |
| [DP-04](#dp-04--chips-de-sub-filtro-da-categoria) | Chips de sub-filtro: só os 3 com respaldo no modelo | US-02 |
| [DP-05](#dp-05--ordenação-da-categoria-só-por-distância) | Ordenação da categoria: só "Distância" no MVP | US-02 |
| [DP-06](#dp-06--filtros-da-busca-ficam-client-side) | Filtros da busca: client-side, só campos existentes | US-03 |
| [DP-07](#dp-07--buscas-recentes-no-navegador) | Buscas recentes guardadas no navegador | US-03 |
| [DP-08](#dp-08--seções-de-cardápio-sem-prato-ficam-ocultas) | Seções de cardápio sem prato ficam ocultas | US-04 |
| [DP-09](#dp-09--opção-de-modificador-esgotada) | Opção de modificador esgotada some da lista | US-05 |
| [DP-10](#dp-10--modificadores-continuam-como-tabelas) | Modificadores continuam como tabelas, não JSON | US-05 |
| [DP-11](#dp-11--identidade-da-linha-na-sacola) | Cada adição vira uma linha nova na sacola | US-06 |
| [DP-12](#dp-12--pedidos-recentes-na-sacola-vazia) | "Pedidos recentes": histórico local, some se vazio | US-06 |
| [DP-13](#dp-13--ver-mapa-sai-do-mvp) | "Ver mapa" sai do MVP | US-06 |
| [DP-14](#dp-14--cupom-entra-no-mvp) | Cupom entra no MVP — regras completas | US-06, US-07, US-08 |
| [DP-15](#dp-15--orderstatus-no-mvp) | `Order.status`: só `PLACED` é escrito no MVP | US-08 |
| [DP-16](#dp-16--qr-sem-assinatura-real) | QR sem assinatura criptográfica real | US-08 |
| [DP-17](#dp-17--me-avisa-quando-abrirvoltar) | "Me avisa": sem canal, vira toast | US-09 |
| [DP-18](#dp-18--openinghour-continua-como-tabela) | `OpeningHour` continua como tabela | US-09 |
| [DP-19](#dp-19--alcance-da-tela-de-erro-10) | Tela de erro (10) é só para falha ao enviar pedido | US-09 |
| [DP-20](#dp-20--últimas-unidades-é-rótulo-manual) | "Últimas unidades" é rótulo manual, sem regra automática | US-09 |
| [DP-21](#dp-21--troca-de-restaurante-com-sacola-entra-no-mvp) | Troca de restaurante com sacola entra no MVP | US-04, US-06, US-10 |
| [DP-22](#dp-22--indica-um-restaurante-sai-do-mvp-funcional) | "Indica um restaurante" sai do MVP funcional | US-03 |
| [DP-23](#dp-23--carregar-mais-sai-do-mvp) | "Carregar mais" (paginação) sai do MVP | US-02 |
| [DP-24](#dp-24--nome-do-cliente-obrigatório-no-checkout) | Nome do cliente obrigatório no checkout | US-08 |
| [DP-25](#dp-25--observação-do-item-opcional-140-caracteres) | Observação do item: opcional, 140 caracteres | US-05 |
| [DP-26](#dp-26--piso-mínimo-de-acessibilidade) | Piso mínimo de acessibilidade do MVP | US-05, US-08 |

---

## DP-01 · Distância vem do seed, não de geolocalização

**Contexto:** o handoff sugere `GET /api/restaurants?lat&lng&radius`
(geolocalização real do navegador), mas `docs/erd.md` guarda
`Restaurant.distanceMeters` como um número fixo por restaurante, e o briefing
do lead (seção C) já fechou o endpoint como `GET /api/restaurants?category=`,
sem parâmetros de coordenada.

**Decisão:** distância é dado de seed. Quem monta o seed escreve um
`distanceMeters` plausível por restaurante (ex.: `1200` para "1,2 km"). Não há
cálculo de geolocalização, não há permissão de navegador pedida, não há
coordenadas reais. "Pertinho de você" e "ordenado por distância" significam
"ordenado por `distanceMeters` crescente" — nada mais sofisticado que isso no
MVP.

**Impacto nas US:** US-01 (ordenação da Home), US-02 (ordenação da categoria,
ver DP-05).

## DP-02 · Bairro de retirada fixo em "Vila Madalena"

**Contexto:** o *pickup pill* do header é clicável em todas as telas do
hi-fi, mas nenhuma tela de troca de bairro foi desenhada — o próprio README do
handoff admite isso ("implementar simples").

**Decisão:** o bairro fica fixo em "Vila Madalena" para toda a release 0.1.0.
O pill continua clicável, por fidelidade ao hi-fi, mas o clique abre um
popover pequeno — não um modal de troca funcional. Copy do popover:

> Por enquanto só rolamos em Vila Madalena — mais bairros chegando em breve.

Botão único: **"Entendi"**. Nenhum dado é lido nem gravado a partir desse
clique; o valor persistido em localStorage é uma constante, não um campo
editável pela pessoa usando o produto.

**Impacto nas US:** US-01.

## DP-03 · "Mais pedidos no bairro" mostra restaurantes

**Contexto:** o título da seção fala de pedidos (soaria a pratos), mas a tela
`01 · Home` renderiza cards de restaurante — o mesmo componente da seção
"Pertinho de você" logo acima, só com outro critério de ordenação.

**Decisão:** a seção lista restaurantes, não pratos individuais — é assim que
está desenhado, e criar uma segunda superfície de "prato em destaque" não
paga o esforço no MVP. Critério de ordenação: `reviewCount` decrescente (mais
avaliado no bairro). O título "Mais pedidos no bairro" permanece como copy,
mesmo a seção mostrando cards de restaurante.

**Impacto nas US:** US-01.

## DP-04 · Chips de sub-filtro da categoria

**Contexto:** a tela `02 · Categoria` desenha oito chips de sub-filtro; só três
têm campo correspondente no ERD (`isOpen`, `rating`, `prepTimeMinutes`).
"Retirada grátis" é redundante (retirada é sempre grátis no Mandaí); faixa de
preço e "Forno a lenha" não existem no modelo.

**Decisão:** entram no MVP, funcionais: **"Todos"**, **"Aberto agora"**
(`isOpen = true`), **"Avaliação 4,5+"** (`rating >= 4.5`), **"Pronto em 20
min"** (`prepTimeMinutes <= 20`). Os demais chips ("Retirada grátis",
"Promoções", "R$ até 50", "Forno a lenha") saem da tela — não vale criar um
campo novo no modelo só para sustentar um chip decorativo. Clareza acima de
completude visual.

**Impacto nas US:** US-02.

## DP-05 · Ordenação da categoria só por distância

**Contexto:** o botão "Ordenar: Distância" sugere a existência de outros
critérios, mas nenhum outro está desenhado em lugar nenhum do handoff.

**Decisão:** um critério só no MVP — distância crescente, usando
`distanceMeters` (DP-01). O controle continua visualmente como um seletor de
ordenação (fidelidade ao hi-fi), com uma única opção ativa e nenhuma outra
disponível no menu.

**Impacto nas US:** US-02.

## DP-06 · Filtros da busca ficam client-side

**Contexto:** o painel de refino da busca (`11 · Busca — resultados`) desenha
faixa de preço (`R$`/`R$R$`/`R$R$R$`) e um slider de distância em km; nenhum
dos dois tem campo no ERD, e o README do handoff permite tanto client-side
quanto refetch.

**Decisão:** os filtros do MVP usam só os campos que já existem:
**"Aberto agora"** (`isOpen`) e **"Pronto em X min"** (`prepTimeMinutes`),
aplicados no cliente sobre o resultado já carregado — sem refetch. Faixa de
preço e distância em km saem do painel: não há preço médio nem coordenada real
no modelo (ver DP-01), e não vale inventar um campo só para o filtro existir.

**Impacto nas US:** US-03.

## DP-07 · Buscas recentes no navegador

**Contexto:** a tela `11b · Busca — sem resultados` mostra chips de "buscas
recentes"; sem cadastro, isso só pode morar no navegador de quem busca.

**Decisão:** entra no MVP, em localStorage — os últimos 5 termos buscados,
sem duplicata, mais recente primeiro. Não sincroniza entre dispositivos, não
sobrevive a limpar dados do navegador. É conveniência de sessão, não
histórico de verdade — e está tudo bem, porque não há cadastro no MVP para
sustentar mais que isso.

**Impacto nas US:** US-03.

## DP-08 · Seções de cardápio sem prato ficam ocultas

**Contexto:** a navegação lateral do design (`03 · Cardápio do restaurante`)
lista seções ("Salgados", "Doces", "Bebidas") sem nenhum item no seed atual.

**Decisão:** a navegação lateral e o corpo do cardápio só mostram seções que
têm ao menos um `MenuItem`. Seção vazia não aparece — nem como item
desabilitado, nem em cinza. Menos ruído visual e nenhum clique morto.

**Impacto nas US:** US-04.

## DP-09 · Opção de modificador esgotada

**Contexto:** `ModifierOption.available` existe no ERD ("a opção pode esgotar
sozinha"), mas nenhuma tela do handoff desenha uma opção indisponível dentro
do modal `04 · Adicionar item`.

**Decisão:** no modal, uma opção com `available: false` simplesmente **não
aparece** na lista de escolhas do grupo — sem badge, sem estado riscado, sem
"esgotado" visual. Ela só não é oferecida. No servidor, `POST /api/orders`
rejeita qualquer opção com `available: false` mesmo que o cliente a tenha
enviado — a mesma lógica de "nunca confiar no navegador" já usada para
`minSelect`/`maxSelect`.

**Impacto nas US:** US-05.

## DP-10 · Modificadores continuam como tabelas

**Contexto:** `docs/erd.md` registra a alternativa mais enxuta — um campo
`MenuItem.modifiersJson` em vez de `ModifierGroup`/`ModifierOption` — ao custo
de perder validação no servidor.

**Decisão:** mantém as duas tabelas relacionais, como já modelado. A
alternativa em JSON está descartada: ela contradiz a exigência do próprio
briefing do lead (seção C) de que `POST /api/orders` revalide
`minSelect`/`maxSelect` de cada grupo no servidor — algo que um JSON solto no
prato não sustenta sem reconstruir a mesma estrutura na leitura.

**Impacto nas US:** US-05.

## DP-11 · Identidade da linha na sacola

**Contexto:** o mesmo prato pedido duas vezes, com modificadores diferentes,
deveria virar uma linha (agrupada) ou duas (distintas)? O design mostra linhas
distintas, mas a regra de agrupamento nunca foi escrita.

**Decisão:** cada clique em "Adicionar à sacola" cria uma linha nova — nunca
funde com uma linha existente, mesmo que prato, modificadores e observação
sejam idênticos. É a regra mais simples de implementar, e é o que a tela `05`
mostra. "Editar item" edita aquela linha específica; não existe merge
automático de linhas.

**Impacto nas US:** US-06.

## DP-12 · "Pedidos recentes" na sacola vazia

**Contexto:** a tela `05b · Sacola vazia` mostra "Pediu na semana passada",
que pressupõe histórico — e não há cadastro no MVP para guardá-lo no servidor.

**Decisão:** guardado em localStorage: o Mandaí registra, neste navegador, os
últimos pedidos confirmados (nome do restaurante, itens e `code`). Se a lista
estiver vazia — primeira visita, ou navegador limpo — a seção inteira **some**
da tela `05b`. Não aparece com placeholder, nem com "nenhum pedido ainda".

**Impacto nas US:** US-06.

## DP-13 · "Ver mapa" sai do MVP

**Contexto:** o botão "Ver mapa" no cabeçalho da sacola não tem destino
definido em nenhuma fonte.

**Decisão:** o botão sai da tela nesta versão. O endereço do restaurante já
aparece em texto (cabeçalho da sacola e tela de confirmação), o que resolve a
necessidade prática. "Ver mapa" fica pra quando existir um link real (Google
Maps a partir do `addressLine`, por exemplo) — barato de adicionar depois, mas
não paga o esforço agora sem destino nenhum.

**Impacto nas US:** US-06.

## DP-14 · Cupom entra no MVP

**Contexto:** o lead já indicou que `MANDA20` entra — está desenhado na tela
`05 · Sacola` e no banner da Home. Faltava fechar as regras: percentual vs.
valor fixo, pedido mínimo, cupom expirado, cupom inválido e o que acontece se
o restaurante fechar com o cupom já aplicado.

**Decisão:** cupom **entra** no MVP, com a entidade `Coupon` do ERD mantida
como está.

- **Seed único:** `MANDA20` — `percentOff: 20` (20% off), `minSubtotal: 3000`
  (pedido mínimo de R$ 30,00), `expiresAt` no domingo da semana de lançamento,
  `active: true`. O modelo suporta percentual **ou** valor fixo
  (`percentOff` xor `amountOffCents`), mas o MVP só usa percentual — um cupom
  só no seed.
- **Endpoint:** `POST /api/coupons/validate { code, subtotalCents }` →
  `{ valid, discountCents, label, message }`. Existe porque o briefing do
  lead (seção C) já autoriza — "é barato e `MANDA20` está desenhado".
- **Onde o desconto é calculado, duas vezes:** `validate` devolve um
  **preview** do desconto a partir do `subtotalCents` que a sacola manda
  naquele momento. `POST /api/orders` **recalcula do zero**, a partir dos
  itens revalidados no banco — nunca confia no `discountCents` que veio da
  tela. Se os dois valores divergirem (a sacola mudou entre validar e
  finalizar), vale o cálculo de `/orders`.
- **Copy de cada estado:**
  - Placeholder do campo: `Código do cupom`
  - Validando: botão "Aplicar" vira **"Aplicando…"** (desabilitado)
  - Válido: linha no resumo `Cupom MANDA20 · −R$ 12,96` (valor calculado), com
    um botão **"Remover"** ao lado
  - Cupom não existe: **"Esse cupom não existe ou não vale mais por aqui."**
  - Cupom expirado: **"Esse cupom já venceu — mas sempre tem outro rolando."**
  - Abaixo do pedido mínimo: **"Faltam R$ {diferença} pro pedido chegar no
    mínimo de R$ 30,00 desse cupom."**
  - Restaurante fechado com cupom já aplicado: não tem copy própria. Ao
    tentar finalizar, prevalece a mensagem padrão de restaurante fechado (ver
    `docs/qa/respostas-po.md`, P-02) — o cupom continua aplicado e só some se
    a sacola for esvaziada (DP-21).

**Impacto nas US:** US-06 (linha de resumo), US-07 (a história inteira),
US-08 (recálculo em `/orders`).

## DP-15 · `Order.status` no MVP

**Contexto:** `docs/erd.md` propõe `PLACED | READY | PICKED_UP | CANCELED`
como proposta, não requisito — o design só desenha o pedido confirmado, sem
tela de acompanhamento.

**Decisão:** o MVP escreve e lê **só `PLACED`**. `Order` nasce em `PLACED` e
morre em `PLACED` — nenhum fluxo desta versão muda o status depois de criado.
Os outros três valores continuam no enum (não fecha a porta para o futuro),
com o significado já registrado no ERD, mas nenhum é produzido nem consultado
por nada no MVP:

| Valor | Significado | No MVP |
|---|---|---|
| `PLACED` | pedido confirmado, código gerado, ainda não retirado | único estado usado |
| `READY` | pronto para retirar no balcão | reservado — sem sinalização nesta versão |
| `PICKED_UP` | atendente validou o QR e entregou | reservado — não há produto do lado do restaurante |
| `CANCELED` | pedido cancelado | reservado — não há fluxo de cancelamento |

**Impacto nas US:** US-08.

## DP-16 · QR sem assinatura real

**Contexto:** `docs/erd.md` descreve `qrPayload` como "URL assinada" no
formato `mandai.app/r/MA-7K2D?sig=…`, o que implica uma chave secreta e uma
rota de verificação que ninguém especificou.

**Decisão:** no MVP, `qrPayload` é uma URL determinística **sem assinatura
criptográfica de verdade**: `https://mandai.app/pedido/{code}` (sem `sig=`). A
palavra "assinada" fica só na copy e no nome do campo — não é um requisito
técnico desta versão, porque não existe produto do lado do atendente para ler
e verificar essa assinatura (isso já está fora do escopo, ver "O que não
entra" da US-08). Se um dia existir esse produto, é a hora certa de assinar de
verdade.

*Correção de 2026-09-06:* esta decisão citava originalmente
`https://mandai.app/r/{code}` — uma rota `/r/` que **não existe** no produto.
O ADR-0009 já havia fixado `/pedido/[codigo]` como a única rota da tela de
confirmação; um QR apontando para `/r/` cairia em 404 para quem abrisse o link
(inclusive quem recebesse por WhatsApp via US-08, não só a câmera do balcão).
Corrigido para `/pedido/{code}` — o mesmo caminho já usado no restante do
produto — para que decisão de produto, ADR e código contem a mesma história.
Ver ADR-0013, que já registra o formato correto do lado técnico.

**Impacto nas US:** US-08.

## DP-17 · "Me avisa quando abrir/voltar"

**Contexto:** os botões das telas `07 · Restaurante fechado` e
`08 · Item esgotado` coletam contato na intenção do handoff, mas nenhuma
entidade guarda isso e não há canal de envio.

**Decisão:** os dois botões ficam visíveis e clicáveis, por fidelidade ao
hi-fi — mas **não coletam contato nem persistem nada**. Nenhuma entidade
`StockAlert` entra no MVP. Clicar mostra um toast que fecha sozinho, sem
modal, sem campo de e-mail ou celular:

- Tela `07`, botão "Me avisa quando abrir":
  > Ainda não mandamos esse aviso — mas anota aí: {Restaurante} abre {próxima
  > abertura}.
- Tela `08`, botão "Me avisa quando voltar":
  > Esse aviso ainda tá em obras por aqui. Vale espiar de novo mais tarde.

**Impacto nas US:** US-09.

## DP-18 · `OpeningHour` continua como tabela

**Contexto:** a alternativa mais enxuta era manter só `isOpen` mais um campo
de texto pronto (`hoursTodayLabel`).

**Decisão:** mantém `OpeningHour` como tabela, já modelada no ERD. A tela `07`
exige a grade semanal completa ("Seg–Sex 7h–13h · Domingo Fechado") e a frase
"abre amanhã às 7h" calculada — nenhuma das duas sai de um campo de texto
solto sem reconstruir, na mão, a mesma estrutura que a tabela já dá de
graça.

**Impacto nas US:** US-09.

## DP-19 · Alcance da tela de erro (10)

**Contexto:** a tela `10 · Erro` foi escrita e desenhada para a falha ao
enviar o pedido especificamente; não estava claro se cobre também outras
falhas de carregamento (lista de restaurantes, cardápio, busca).

**Decisão:** a tela cheia — com código técnico copiável e os três cartões de
diagnóstico (conexão, restaurante, pedido salvo) — é **exclusiva** da falha em
`POST /api/orders`. As demais falhas usam um tratamento inline, mais leve: um
bloco no lugar do conteúdo com a copy:

> Não rolou carregar agora.

e um botão **"Tentar de novo"** — sem código técnico, sem diagnóstico em três
cartões. A gravidade do tratamento é proporcional ao dano: perder a sacola no
meio do checkout é sério; falhar um `GET` de listagem, a pessoa só tenta de
novo.

**Impacto nas US:** US-09.

## DP-20 · "Últimas unidades" é rótulo manual

**Contexto:** não há regra de negócio dizendo quando um prato entra no estado
`LOW_STOCK` — hoje é um valor digitado à mão no cadastro.

**Decisão:** confirma o que o ERD já registra: `MenuItem.availability` é um
**rótulo**, editado manualmente por quem monta o cardápio (o seed, no MVP) —
não existe contagem de unidades nem regra automática de negócio calculando
esse estado. Um painel de gestão de cardápio que atualize isso em tempo real
fica fora do MVP.

**Impacto nas US:** US-09.

## DP-21 · Troca de restaurante com sacola entra no MVP

**Contexto:** sem tela desenhada — a regra só está descrita em prosa no README
do handoff ("mostrar modal de confirmação"). Sem ela, a sacola pode ser
substituída sem aviso nenhum, que é a pior perda silenciosa do fluxo. US-10
está marcada como opcional, mas o risco de dado perdido é alto o bastante
para decidir por dentro.

**Decisão:** **entra no MVP.**

- **Onde o aviso aparece:** no clique que abriria o modal de customização de
  um item de **outro** restaurante, com a sacola não vazia — antes de a
  pessoa gastar esforço escolhendo acompanhamentos e adicionais. Confirmar
  dentro do modal, só depois de tudo escolhido, desperdiçaria esse esforço se
  a resposta for cancelar.
- **Copy do diálogo** (coloquial paulistano, sem tela desenhada anterior):

  > **Trocar de restaurante?**
  >
  > Sua sacola tem itens de {restaurante atual}. Pra pedir de {restaurante
  > novo}, a gente esvazia a sacola e começa do zero.

  Botões: **"Continuar em {restaurante atual}"** (cancela — não mexe em
  nada, o item novo não entra) e **"Esvaziar e trocar"** (confirma — some a
  sacola, adiciona o item novo do restaurante novo).
- **Sem desfazer:** confirmar a troca é definitivo nesta versão — não guarda
  a sacola anterior para recuperação.

**Impacto nas US:** US-04 (ponto de disparo), US-06 (consequência sobre a
sacola), US-10 (a história inteira).

## DP-22 · "Indica um restaurante" sai do MVP funcional

**Contexto:** o link na tela `11b` é um caminho de aquisição sem formulário,
entidade ou processo por trás.

**Decisão:** o link continua na tela, por fidelidade ao hi-fi, mas não abre
formulário nem envia nada. Clicar mostra um toast:

> Ainda não temos esse formulário de pé. Mas valeu a lembrança!

**Impacto nas US:** US-03.

## DP-23 · "Carregar mais" sai do MVP

**Contexto:** a tela `02 · Categoria` desenha "Carregar mais pizzarias", mas
nenhum endpoint do plano prevê paginação — e o `ARQUITETURA.md` §8 já lista
paginação como extensão pós-MVP.

**Decisão:** o botão sai das telas `02` e de busca. A lista traz **todos** os
resultados do bairro/categoria de uma vez, sem paginação de servidor nem de
cliente. O seed tem de 6 a 8 restaurantes ao todo (convenção operacional do
briefing, seção E) — nenhuma lista do MVP é grande o bastante para precisar de
paginação de verdade.

**Impacto nas US:** US-02.

## DP-24 · Nome do cliente obrigatório no checkout

**Contexto:** a tela `06` pede "Seu nome" com foco automático, mas a validação
nunca foi escrita.

**Decisão:** campo **obrigatório**. Mínimo de 2 caracteres depois de
`trim()`, máximo de 60. O CTA "Confirmar pedido" fica desabilitado enquanto o
campo não passa na validação — mesma lógica de "bloquear até resolver" já
usada no CTA do modal de customização (US-05). Mensagem de erro, se a pessoa
tentar confirmar com o campo vazio, só com espaços, ou com 1 caractere:

> Escreve seu nome (pelo menos 2 letrinhas) pra gente te chamar no balcão.

**Impacto nas US:** US-08.

## DP-25 · Observação do item: opcional, 140 caracteres

**Contexto:** o campo de observação no modal de customização (`note`) nunca
teve sua obrigatoriedade nem a copy do placeholder e do contador definidas.

**Decisão:** campo **opcional** — dá para adicionar à sacola com o campo
vazio. Placeholder: `Algum recado pro restaurante? (opcional)`. Contador no
formato `0/140`, que muda para tomate só quando chega no limite. Não há
mensagem de erro de validação: o campo trava em 140 caracteres via `maxlength`
nativo, não deixa digitar além.

**Impacto nas US:** US-05.

## DP-26 · Piso mínimo de acessibilidade

**Contexto:** o handoff pede foco preso no modal, Esc, `aria-label` no QR e
rótulo em todo campo; `ARQUITETURA.md` §11 tira WCAG do escopo. As duas fontes
discordam.

**Decisão:** o MVP entrega o que já é **inerente** a implementar a
funcionalidade direito, e não faz auditoria de acessibilidade além disso.

Entra (custa zero ou quase, e parte já é requisito funcional, não só a11y):

- Foco preso (*focus trap*) e Esc no modal de customização — já é requisito
  funcional da US-05, não um extra de acessibilidade.
- `<label>` associado a todo campo de formulário (nome, cupom, busca,
  observação).
- `aria-label` em botão *icon-only* (fechar modal, lixeira da sacola, copiar
  código).
- `aria-label` no QR code com o código por extenso, com o código em texto ao
  lado como alternativa — já é requisito funcional da US-08.
- Outline de foco visível — já vem de `tokens.css`; a decisão aqui é só não
  removê-lo.

Fica fora (é o que `ARQUITETURA.md` §11 já cortou, e o motivo se mantém — este
é material de mentoria, não um produto sob obrigação de conformidade):

- Auditoria WCAG AA/AAA formal.
- Teste com leitor de tela.
- `role="spinbutton"` no seletor de quantidade — um `<input type="number">`
  nativo com os botões +/- ao lado já é acessível o bastante, sem o
  vocabulário extra de ARIA.
- Navegação 100% por teclado testada ponta a ponta.

O piso escolhido é exatamente o que sai de graça ao construir a funcionalidade
certa; qualquer coisa além disso é trabalho dedicado que a mentoria já tirou
do escopo.

**Impacto nas US:** US-05, US-08, e transversalmente todo formulário do
produto.
