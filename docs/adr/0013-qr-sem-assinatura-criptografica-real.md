# ADR-0013: QR sem assinatura criptográfica real

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

`docs/erd.md` descreve `Order.qrPayload` como "URL assinada lida no balcão", no formato
`mandai.app/r/MA-7K2D?sig=…`, e o ADR-0006 (sem autenticação no MVP) já se apoiou nessa
descrição para justificar por que `GET /api/orders/:code` pode ser público: "a
assinatura é o que substitui a autorização". O problema é que nem `ARQUITETURA.md` nem
o ERD especificam **quem gera a assinatura**, **com que chave**, nem **quem verifica**
— e não existe, em nenhuma tela do handoff nem em nenhuma US, um produto do lado do
atendente que leia esse QR e valide algo. `sig=…` era, até esta decisão, uma palavra no
nome de um campo sem processo por trás.

Isso é o tipo de lacuna perigosa numa arquitetura de mentoria: alguém lê "URL
assinada" no ERD, ou `qrPayload` no schema, e assume que existe uma garantia
criptográfica de que aquele QR não pode ser forjado — quando na verdade não há chave
secreta gerada, não há HMAC calculado sobre nada verificável, e não há endpoint que
receba `sig` e confirme validade. O `product-owner-agent` já havia registrado essa
mesma lacuna do lado de produto em
[DP-16](../decisoes-produto.md#dp-16--qr-sem-assinatura-real); este ADR formaliza a
implicação técnica e ajusta a leitura do ADR-0006, sem reabri-lo.

## Decisão

No MVP, `qrPayload` é uma URL **determinística, sem assinatura criptográfica de
verdade**:

```
https://mandai.app/pedido/{code}
```

Sem `?sig=`. O único "segredo" embutido no payload é o próprio `code` — que já é
gerado com o alfabeto de 32 símbolos sem caracteres ambíguos do ADR-0006/`docs/erd.md`
(`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, 4 posições, ~1 milhão de combinações). Não existe
`crypto.createHmac`, não existe chave de assinatura em variável de ambiente, e não
existe rota que receba `sig` e verifique algo — porque não existe, do outro lado, um
produto que leia essa assinatura. Construir uma assinatura sem verificador é
criptografia decorativa: pareceria mais seguro sem proteger nada a mais.

A palavra "assinada" continua existindo em `docs/erd.md` (que este ADR não edita) e em
qualquer copy que fale do QR — ela descreve a **intenção de produto** ("este código
identifica você no balcão de forma confiável o bastante"), não uma garantia técnica.
Este ADR existe justamente para que ninguém confunda as duas coisas ao ler o código ou
o schema.

A garantia real de acesso ao pedido, hoje, é a mesma que o ADR-0006 já descreve:
**imprevisibilidade do código**, não assinatura. `GET /api/orders/:code` continua
público; a defesa é o espaço de busca do `code` ser grande o bastante para não ser
enumerado por tentativa, não uma verificação criptográfica.

Se um dia existir produto do lado do restaurante para ler o QR e confirmar retirada
(`PICKED_UP`, ver ADR-0014), **essa** é a hora de assinar de verdade — HMAC com chave
do servidor, endpoint de verificação, e possivelmente TTL na assinatura. Até lá,
assinar sem verificar não compra nada.

## Consequências

O código fica honesto sobre o que faz: uma função pura que interpola `code` numa URL,
sem gerar nem guardar segredo nenhum. Ninguém vai abrir `create-order.ts` esperando
achar uma chave HMAC e ficar confuso ao não encontrar — porque ela genuinamente não
deveria existir ainda.

Isso também poupa uma decisão cara que não tem como ser bem tomada agora: chave de
assinatura precisa de gestão de segredo (variável de ambiente, rotação, ambiente de
build vs. runtime), e nenhuma dessas coisas tem para onde ir sem um verificador do
outro lado.

Os custos, sem eufemismo:

- **A palavra "assinada" no ERD e a variável `qrPayload` continuam sugerindo mais
  segurança do que existe.** Este ADR mitiga isso registrando a lacuna, mas não
  renomeia o campo — `docs/erd.md` é read-only para este agente (regra de
  colaboração), e renomear só o código criaria uma discrepância nova entre schema e
  ERD, do tipo que o ADR-0007 pede para nunca acontecer.
- **Qualquer um que conheça (ou adivinhe) um `code` válido acessa o pedido inteiro**,
  incluindo `customerName` — exatamente o risco que o ADR-0006 já assume e nomeia. Este
  ADR não piora esse risco; só deixa explícito que uma "assinatura" não está mitigando
  nada além do que o próprio `code` já mitiga.
- **Se alguém tentar adicionar o produto do atendente sem revisitar este ADR**, pode
  escrever um "verificador" que só confere se a URL tem o formato certo, sem checar
  segredo nenhum — dando falsa sensação de validação. Fica registrado aqui que esse dia
  exige uma chave de verdade, não decoração.

## Alternativas consideradas

**Gerar uma assinatura real desde já** (HMAC-SHA256 com uma chave em variável de
ambiente, tipo `createHmac('sha256', QR_SECRET).update(code).digest('hex')`), mesmo sem
verificador. Descartado porque criaria trabalho e uma variável de ambiente nova
(`QR_SECRET`) só para produzir uma string que nada consome — o tipo de abstração que
`ARQUITETURA.md` pede para evitar quando "precisa de explicação antes de ser entendida
e não paga nada de volta".

**Remover `qrPayload` do MVP e gerar o QR só a partir do `code` no frontend**, sem
campo de URL no `Order`. Reduziria a superfície do schema. Descartado porque o ERD já
modela `qrPayload` como parte do fato histórico do pedido (junto com `code`,
`estimatedReadyAt` etc.) e mudar isso é uma decisão de modelo de dados, fora do escopo
deste agente (`docs/erd.md` não é tocado por este ADR) — além de o `qrPayload` como URL
completa (em vez de só o código) já ser o que a tela `06` do handoff espera codificar
no QR (um link, não só o código nu), então o campo tem função própria mesmo sem
assinatura.

**Adicionar `sig` com verificação apenas de formato (não de segredo)** — por exemplo,
um checksum simples do `code`, só para "parecer" uma URL de sistema real. Descartado
por ser pior que não ter nada: um checksum sem segredo é trivialmente recalculável por
qualquer pessoa, então não adiciona proteção alguma e ainda sugere, pela presença do
parâmetro, que existe alguma.
