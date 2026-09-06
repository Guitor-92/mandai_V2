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

## [DECISÃO PENDENTE]

- **"Me avisa quando abrir" e "Me avisa quando voltar".** Os dois botões
  coletam contato, mas nenhuma entidade guarda isso. O ERD registra que, se
  entrar, vira algo como `StockAlert`; por ora está fora do MVP. Decidir se os
  botões ficam desabilitados, escondidos, ou se a entidade entra.
- **`OpeningHour` como tabela.** A alternativa enxuta é manter só `isOpen` mais
  um texto pronto de horário — mas aí a tela `07` perde a grade semanal.
- **Alcance da tela `10`.** Ela está escrita para a falha do envio do pedido.
  Falta definir se as demais falhas (lista não carrega, cardápio não carrega)
  reaproveitam a mesma tela ou ganham tratamento inline.
- **Quem decide "Últimas unidades".** Não há regra de negócio dizendo quando um
  prato entra nesse estado — hoje é um valor digitado à mão no cadastro.
