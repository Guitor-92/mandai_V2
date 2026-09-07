# US-10: Trocar de restaurante com sacola

> **Confirmada no MVP.** Estava marcada como opcional; o PO decidiu que
> **entra** — sem ela a sacola pode ser substituída sem aviso, a pior perda
> silenciosa possível no fluxo. Ver
> [DP-21](../decisoes-produto.md#dp-21--troca-de-restaurante-com-sacola-entra-no-mvp).

**Como** cliente, **quero** ser avisado ao mudar de restaurante com itens na sacola, **para** não perder a seleção.

- Referência visual: **nenhuma tela desenhada.** A regra está escrita no `README.md` do handoff (seção "Estado global"); o gatilho acontece em `03 · Cardápio do restaurante` e `04 · Adicionar item (modal)`, e a consequência aparece em `05 · Sacola` / `05b · Sacola vazia`
- Estados envolvidos: sacola vazia (nada acontece), sacola do mesmo restaurante (nada acontece), sacola de outro restaurante (aviso), confirmado (sacola trocada), cancelado (sacola preservada)
- Entidades de domínio: `Restaurant` (regra do lado do navegador; a sacola não é entidade persistida)

## Contexto

A sacola do Mandaí é **mono-restaurante**: cada pedido sai de uma casa só, tem
um código só e é retirado num balcão só. Isso não é limitação técnica — é o
modelo do produto, e o `Order` reflete isso com um único restaurante por pedido.

A regra é do handoff: ao adicionar um item de outro restaurante com a sacola
não vazia, mostrar uma confirmação do tipo "Limpar sacola e começar de novo?".

Como a sacola vive só no navegador, cancelar significa manter o que já estava
lá e não adicionar o novo item; confirmar significa esvaziar tudo e recomeçar
com o item novo, já do restaurante novo.

## O que entra

- Detectar, na hora de adicionar, que o item é de outro restaurante.
- Confirmação nomeando os dois restaurantes e dizendo claramente o que se perde.
- Confirmar: esvaziar a sacola e adicionar o item novo.
- Cancelar: não mexer em nada, e o item novo não entra.
- Navegar entre restaurantes sem aviso nenhum — o alerta só aparece na
  tentativa de adicionar.

## O que NÃO entra

- Sacolas simultâneas, uma por restaurante.
- Pedido único cobrindo várias casas.
- Desfazer a limpeza depois de confirmada.
- Guardar a sacola descartada para depois.

## Decisão e especificação do diálogo

Tudo isso está fechado em
[DP-21](../decisoes-produto.md#dp-21--troca-de-restaurante-com-sacola-entra-no-mvp):

- **Onde o aviso aparece:** no clique do `+` no cardápio (que abriria o modal
  de customização), não depois de a pessoa já ter escolhido tudo no modal —
  evita desperdiçar o esforço da escolha se a resposta for cancelar.
- **Título:** "Trocar de restaurante?"
- **Corpo:** "Sua sacola tem itens de {restaurante atual}. Pra pedir de
  {restaurante novo}, a gente esvazia a sacola e começa do zero."
- **Botão de cancelar:** "Continuar em {restaurante atual}" — não mexe em
  nada, o item novo não entra.
- **Botão de confirmar:** "Esvaziar e trocar" — esvazia a sacola e adiciona o
  item novo.
- **Sem desfazer:** confirmar a troca é definitivo; a sacola anterior não é
  guardada para recuperação.

## Critérios de aceite

- Com a sacola vazia, clicar em `+` em qualquer restaurante abre o modal de
  customização direto, sem diálogo nenhum.
- Com a sacola cheia de itens do mesmo restaurante, clicar em `+` também abre
  o modal direto.
- Com a sacola cheia de itens de **outro** restaurante, clicar em `+` mostra o
  diálogo especificado acima antes de qualquer modal de customização.
- Clicar em "Continuar em {restaurante atual}" fecha o diálogo, mantém a
  sacola intacta e não abre o modal de customização do item novo.
- Clicar em "Esvaziar e trocar" esvazia a sacola, fecha o diálogo e abre o
  modal de customização do item do restaurante novo.
- Navegar entre páginas de restaurantes diferentes, sem tentar adicionar
  item, nunca dispara o diálogo.
