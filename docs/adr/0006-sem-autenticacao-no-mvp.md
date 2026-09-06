# ADR-0006: Sem autenticação no MVP

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

O handoff de design tem uma tela de login (artboard `09 · Login`), e ela está marcada
como **v2** — escopo de versão futura. O próprio `README.md` do handoff diz que
`/login` fica fora do MVP.

O produto também não pede autenticação para funcionar. Mandaí é retirada no balcão:
não há entrega, não há cadastro obrigatório, e o pagamento acontece presencialmente no
restaurante. O fluxo inteiro — descobrir, escolher, montar sacola, finalizar — funciona
sem saber quem é a pessoa. O único dado que o sistema precisa é um nome, para o
atendente chamar no balcão.

Do lado da arquitetura, autenticação é um dos assuntos mais caros que existem para
introduzir: sessão ou JWT, armazenamento de token, refresh, middleware de proteção de
rota, hash de senha, recuperação de acesso, e a fronteira entre rotas públicas e
privadas no App Router. Nada disso ensina inversão de dependência, camadas ou
Server Components — os conceitos-âncora da mentoria. Seria a maior fatia de código do
projeto servindo ao menor objetivo didático.

Existe ainda a força de coerência: `ARQUITETURA.md` §11 lista auth explicitamente fora
do plano e §8 a coloca como extensão pós-MVP.

## Decisão

O MVP não tem autenticação, cadastro, sessão nem noção de usuário logado.

Não existe entidade `User` ou `Customer` no schema. `docs/erd.md` registra isso: o
único dado pessoal do sistema é `Order.customerName`.

O checkout coleta **apenas o nome do cliente**, e ele existe por uma razão operacional
única — compor a identificação do pedido junto com o código `MA-XXXX` que o atendente
chama no balcão.

Todos os endpoints da API são públicos.

A tela `09 · Login` do handoff **não é portada**. Fica como referência visual para
quando a auth entrar.

A identidade do pedido é o **código de retirada**: quem tem o código (e o `qrPayload`)
acessa o pedido. Não há dono.

Auth fica registrada como extensão pós-MVP, e é o exercício natural para quem quiser
continuar depois da mentoria.

## Consequências

O caminho crítico do produto fica curto e demonstrável: dá para abrir a Home, montar
uma sacola e chegar na tela de confirmação sem criar conta, o que é ótimo tanto para o
usuário fictício quanto para a demonstração ao vivo.

O backend fica sem middleware de autenticação, sem guardas de rota e sem estado de
sessão — cada endpoint é uma função pura de request para response, o que torna a
leitura das camadas mais limpa. O frontend não precisa de rota protegida nem de estado
global de usuário.

Sem `User`, o ERD perde uma tabela e vários relacionamentos, e o `CreateOrderUseCase`
não precisa resolver identidade antes de criar o pedido.

Os custos, sem maquiagem:

- **Qualquer um cria pedido.** Não há rate limit, não há CAPTCHA, não há verificação.
  `POST /api/orders` é um endpoint público de escrita — em produção real isso seria um
  vetor de abuso imediato.
- **`GET /api/orders/:id` é acessível a quem tiver o identificador.** A proteção é a
  imprevisibilidade do código, não uma verificação de permissão. Se `id` ou `code`
  forem enumeráveis, qualquer pedido é legível — incluindo o `customerName` de outra
  pessoa. É por isso que o código `MA-XXXX` é alfanumérico maiúsculo sem caracteres
  ambíguos e o `qrPayload` é uma URL assinada: a assinatura é o que substitui a
  autorização.
- **Não existe histórico de pedidos.** Sem usuário, não há "meus pedidos". Se a pessoa
  perder o código, o pedido está perdido para ela.
- **A sacola vive só no navegador.** `localStorage`, sem sincronização entre
  dispositivos. Limpar dados do site apaga a sacola.
- **Introduzir auth depois é uma mudança de verdade.** Vai exigir a entidade `User`,
  uma FK opcional em `Order`, migração, middleware no Fastify, proteção de rota no
  App Router e decisão sobre pedidos anônimos legados. Isso não é acidente — é o
  exercício, e o custo faz parte da lição.

Quando a auth entrar, **este ADR não é editado**: cria-se um novo ADR e este passa a
`Superseded by ADR-NNNN` (ADR-0007).

## Alternativas consideradas

**Auth completa com e-mail e senha.** Daria um sistema mais parecido com o mundo real e
permitiria histórico de pedidos. Descartada porque seria a maior parte do código do
projeto a serviço do menor objetivo didático — e porque o produto, sendo pickup com
pagamento no balcão, genuinamente não precisa saber quem é a pessoa.

**Auth social (Google/GitHub via NextAuth ou Auth.js).** Muito menos código que auth
própria e resolve senha, recuperação e sessão de uma vez. Descartada mesmo assim: exige
configurar OAuth app, client ID e secret em dois ambientes antes de qualquer aluno
conseguir rodar o projeto na própria máquina. Fere diretamente o princípio do ADR-0001
de que `npm install && npm run dev` deve bastar.

**Auth anônima com identificador de dispositivo em cookie.** Permitiria histórico de
pedidos sem cadastro, com custo baixo. Descartada porque introduziria a entidade
`User`, gestão de cookie e o conceito de sessão anônima — três conceitos novos — para
entregar uma funcionalidade ("meus pedidos") que não está em nenhuma das 13 telas do
handoff. Resolver problema que o design não tem.

**Nome do cliente como cadastro leve (nome + telefone salvos e reutilizados).**
Descartada porque telefone é dado pessoal com implicações de LGPD que o projeto não
quer nem precisa carregar, e porque não muda nada no fluxo do balcão: o atendente chama
pelo código.

**Proteger `GET /api/orders/:id` com um token no `qrPayload`.** Foi *parcialmente*
adotada — é exatamente o que a URL assinada faz. O que se descartou foi construir um
esquema formal de autorização em volta disso; a assinatura do QR é a garantia
suficiente para o escopo do MVP, e vale registrar que ela é a única linha de defesa.
