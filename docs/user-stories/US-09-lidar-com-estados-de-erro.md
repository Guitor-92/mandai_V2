# US-09: Lidar com estados de erro

**Como** cliente, **quero** ver mensagem clara em restaurante fechado, item esgotado, busca sem resultados ou erro técnico, **para** entender o que houve e saber o que fazer em seguida.

- Referência visual: `07 · Restaurante fechado`, `08 · Item esgotado`, `11b · Busca — sem resultados`, `10 · Erro`
- Estados envolvidos: fechado, últimas unidades, esgotado, busca sem resultados, falha técnica
- Entidades de domínio: `Restaurant` (campo `isOpen`), `OpeningHour`, `MenuItem` (campo `availability`), `Order`

## Contexto

São quatro becos sem saída diferentes, e cada um ganhou tratamento próprio no
design. O que os une é a regra de conduta: dizer o que aconteceu em português
claro, não culpar quem está do outro lado da tela e sempre oferecer uma saída.

### Restaurante fechado — `07`

Banner escuro no topo ("Fechado agora. A Padaria do Zé abre amanhã às 7h") com
o botão "Me avisa quando abrir". A capa fica dessaturada, o selo vira
"Fechado · Abre amanhã 7h" e o cardápio continua visível, mas só para leitura —
não dá para adicionar nada. Ao lado, a grade semanal de horários
("Seg–Sex 7h–13h · Sábado … · Domingo Fechado") e uma lista de restaurantes
abertos por perto.

O `isOpen` responde "posso pedir agora?" e é barato; a grade semanal e a frase
"abre amanhã às 7h" só saem dos horários estruturados, guardados como minutos
desde a meia-noite.

### Item esgotado — `08`

São **três** estados visuais, não dois: prato normal, "Últimas unidades"
(selo âmbar, ainda pedível, criando urgência) e "Esgotado" (prato em cinza,
botão vira "Me avisa"). Clicar no esgotado abre um modal explicativo: o prato
acabou naquela casa e a gente pode avisar quando voltar.

### Busca sem resultados — `11b`

Detalhada na US-03. Repete o termo buscado, sugere termos parecidos, mostra
buscas recentes e categorias, e oferece "Indica um restaurante".

### Erro técnico — `10`

"Ih, deu ruim aqui." Explica em uma frase o que falhou (não deu para enviar o
pedido), tranquiliza — "Seu rango tá salvo" —, mostra o código técnico do erro
com botão de copiar, um diagnóstico em três cartões (conexão, restaurante,
pedido salvo) e três ações: "Tentar de novo", "Voltar pra sacola" e
"Falar com a gente".

## O que entra

- Bloquear a adição de itens quando o restaurante está fechado, mantendo o
  cardápio legível.
- Banner de fechado com a próxima abertura e a grade semanal de horários.
- Sugestão de restaurantes abertos por perto.
- Os três estados de disponibilidade do prato, com o visual de cada um.
- Modal explicativo do prato esgotado.
- Estado de busca sem resultados com caminhos de saída.
- Tela de erro com código copiável e as três ações — sem perder a sacola.

## O que NÃO entra

- Enviar de fato o aviso de "abriu" ou "voltou ao estoque" — só a coleta.
- Controle de estoque com contagem de unidades; `availability` é um rótulo
  de três valores, não um número.
- Registro estruturado de erros, rastreamento ou métricas — o
  `ARQUITETURA.md` §11 deixa observabilidade fora do plano.
- Tela `09 · Login` — é v2, fora do MVP por decisão explícita.
- "Falar com a gente" como canal funcional.

## Decisões

- **"Me avisa quando abrir/voltar":** os botões ficam, mas viram um toast sem
  coletar contato nenhum —
  [DP-17](../decisoes-produto.md#dp-17--me-avisa-quando-abrirvoltar).
- **`OpeningHour` como tabela:** mantida — a grade semanal da tela `07`
  precisa dela —
  [DP-18](../decisoes-produto.md#dp-18--openinghour-continua-como-tabela).
- **Alcance da tela `10`:** exclusiva da falha em `POST /api/orders`; as
  demais falhas de carregamento usam tratamento inline —
  [DP-19](../decisoes-produto.md#dp-19--alcance-da-tela-de-erro-10).
- **"Últimas unidades":** rótulo manual do cadastro, sem regra automática —
  [DP-20](../decisoes-produto.md#dp-20--últimas-unidades-é-rótulo-manual).

## Critérios de aceite

- Restaurante com `isOpen: false`: cardápio abre normalmente, mas nenhum item
  tem `+` clicável nem abre modal de customização — o cardápio é só leitura.
- A tela mostra o banner "Fechado agora", a próxima abertura, a grade semanal
  completa e uma lista de restaurantes abertos por perto.
- Clicar em "Me avisa quando abrir" mostra o toast de DP-17 e não abre
  nenhum campo de contato.
- Prato `LOW_STOCK` mostra o selo "Últimas unidades" e continua pedível
  normalmente pelo `+`.
- Prato `OUT_OF_STOCK` aparece em cinza, sem `+` funcional; clicar nele abre o
  modal explicativo (não o modal de customização), com o botão "Me avisa
  quando voltar" mostrando o toast de DP-17.
- Buscar sem resultado leva à tela `11b` (ver critérios de aceite de US-03).
- `POST /api/orders` falhando mostra a tela `10` completa (código copiável,
  três diagnósticos, três ações) sem esvaziar a sacola.
- Qualquer outro `GET` falhando (lista, cardápio, busca) mostra o bloco
  inline "Não rolou carregar agora." com o botão "Tentar de novo", sem levar
  à tela `10`.
