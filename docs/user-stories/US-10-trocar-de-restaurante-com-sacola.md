# US-10: Trocar de restaurante com sacola

> **Opcional no MVP.** Sem ela nada quebra tecnicamente — mas a sacola pode ser
> substituída sem aviso, o que é a pior perda silenciosa possível no fluxo.

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

## [DECISÃO PENDENTE]

- **Não há tela.** O aviso não foi desenhado — nem layout, nem copy, nem os
  rótulos dos botões. É preciso escrever tudo isso seguindo o tom do resto do
  produto ("coloquial paulistano, sem gírias forçadas") antes de implementar.
- **Onde o aviso aparece.** No clique do `+` no cardápio, ou só ao confirmar
  dentro do modal de customização (depois de a pessoa já ter escolhido tudo)?
  A segunda opção desperdiça o esforço da escolha.
- **A pessoa pode voltar atrás?** Guardar a sacola anterior por alguns minutos
  para permitir desfazer é possível, mas não está previsto em lugar nenhum.
