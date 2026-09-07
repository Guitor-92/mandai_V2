# User Stories — Mandaí

Escopo do MVP derivado do design handoff (`design_handoff_mandai_web/`), do
modelo de domínio (`docs/erd.md`) e do plano de arquitetura (`ARQUITETURA.md`).

O objetivo aqui é **mapear escopo para a conversa de mentoria**, não abastecer
um sprint planning — por isso não há estimativas. Cada história diz o que
entra, o que não entra, as decisões de produto que fecharam as ambiguidades
originais (ver `docs/decisoes-produto.md`) e uma seção **Critérios de
aceite**, curta e verificável, para backend e frontend saberem quando
terminaram.

**Uma história por arquivo.** Numeração de dois dígitos, nome em kebab-case:
`US-NN-titulo-curto.md`.

---

## Índice

| # | História | Telas do handoff | Status |
|---|---|---|---|
| [US-01](US-01-descobrir-restaurantes.md) | Descobrir restaurantes | `01 · Home` | MVP |
| [US-02](US-02-filtrar-por-categoria.md) | Filtrar por categoria | `01 · Home`, `02 · Categoria` | MVP |
| [US-03](US-03-buscar.md) | Buscar | `11 · Busca — resultados`, `11b · Busca — sem resultados` | MVP |
| [US-04](US-04-ver-cardapio.md) | Ver cardápio | `03 · Cardápio do restaurante` | MVP |
| [US-05](US-05-customizar-item.md) | Customizar item | `04 · Adicionar item (modal)` | MVP |
| [US-06](US-06-gerenciar-sacola.md) | Gerenciar sacola | `05 · Sacola`, `05b · Sacola vazia` | MVP |
| [US-07](US-07-aplicar-cupom.md) | Aplicar cupom | `05 · Sacola`, `01 · Home` | MVP — confirmado em [DP-14](../decisoes-produto.md#dp-14--cupom-entra-no-mvp) |
| [US-08](US-08-finalizar-e-receber-codigo.md) | Finalizar e receber código | `06 · Pedido confirmado` | MVP |
| [US-09](US-09-lidar-com-estados-de-erro.md) | Lidar com estados de erro | `07 · Restaurante fechado`, `08 · Item esgotado`, `11b · Busca sem resultados`, `10 · Erro` | MVP |
| [US-10](US-10-trocar-de-restaurante-com-sacola.md) | Trocar de restaurante com sacola | *(sem tela desenhada — copy especificada na história)* | MVP — confirmado em [DP-21](../decisoes-produto.md#dp-21--troca-de-restaurante-com-sacola-entra-no-mvp) |

### Fluxo principal

```
US-01 Home ──> US-02 Categoria ──┐
     └────────> US-03 Busca ─────┼──> US-04 Cardápio ──> US-05 Modal ──> US-06 Sacola ──> US-08 Confirmação
                                 │                             │              │
                                 │                             └── US-10 ─────┘  (troca de restaurante)
                                 │                                            └── US-07 Cupom
                                 └── US-09 cobre os becos sem saída de todas as etapas
```

---

## Template padrão

```markdown
# US-NN: <Título curto>

**Como** [usuário], **quero** [ação], **para** [benefício].

- Referência visual: <tela/mockup do handoff, pelo identificador — ex: `03 · Cardápio do restaurante`>
- Estados envolvidos: <vazio, carregando, erro, populado…>
- Entidades de domínio: <nomes do docs/erd.md>

## Contexto

Por que esta história existe e o que a tela mostra.

## O que entra

- …

## O que NÃO entra

- …

## [DECISÃO PENDENTE]

- Só quando a fonte for ambígua ou duas fontes se contradisserem. Uma vez
  decidido pelo PO, o bloco vira `## Decisões`, com link para a entrada em
  `docs/decisoes-produto.md`.

## Critérios de aceite

- Lista curta e verificável, do ponto de vista de quem usa. Sem estimativa,
  sem ponto de história.
```

Convenções:

- Entidades sempre com o nome real do `docs/erd.md`: `Restaurant`,
  `OpeningHour`, `MenuSection`, `MenuItem`, `ModifierGroup`, `ModifierOption`,
  `Order`, `OrderItem`, `Coupon`.
- Telas sempre pelo identificador do handoff (`05b · Sacola vazia`), nunca por
  descrição solta.
- Linguagem simples. Se um termo técnico não for indispensável, ele sai.

---

## Fora do escopo destas histórias

Confirmado pelo `ARQUITETURA.md` §11 e pelo próprio handoff:

- **Autenticação / login.** A tela `09 · Login` está marcada como v2.
- **Pagamento.** É no balcão, direto com o restaurante.
- **Responsividade mobile.** O handoff entrega desktop 1440 px apenas.
- **i18n, tema escuro, conformidade WCAG.**
- **Testes ponta a ponta e observabilidade.**

---

## [SUGESTÃO ADICIONAL]

Coisas que apareceram nas fontes e não estão cobertas pelas dez histórias
acima. Nenhuma virou US numerada — ficam aqui como pauta de mentoria.

> Seis itens que estavam nesta lista já foram decididos pelo PO e saíram
> daqui: bairro de retirada fixo, coleta de contato para avisos, "Indica um
> restaurante", acessibilidade (piso mínimo definido), paginação e o
> identificador de restaurante. Ver `docs/decisoes-produto.md`
> (DP-02, DP-17, DP-22, DP-26, DP-23) e `docs/qa/00-briefing-do-lead.md`
> (seção A, para o identificador).

1. **Contradição sobre a plataforma.** O overview do handoff descreve o Mandaí
   como "app web **mobile-first**", mas logo abaixo o escopo da entrega diz
   "desktop apenas (1440 px)", e o `ARQUITETURA.md` §11 tira responsividade do
   plano. Para um produto de retirada — usado em pé, na rua, a caminho do
   balcão — vale decidir isso conscientemente e registrar em ADR.

2. **Tela `09 · Login` (v2).** Está desenhada por inteiro, com os benefícios
   prometidos (reordenar em 2 cliques, favoritos, cupons exclusivos) e login
   social. Fora do MVP, mas é o candidato natural a "exercício extra" citado
   no §8 do plano — e destrava o histórico que as telas `05b` e `11b` já
   insinuam ("Pediu na semana passada", buscas recentes) — hoje resolvido de
   forma simples via localStorage (DP-07, DP-12).

3. **SEO das páginas de restaurante.** O handoff pede renderização no servidor
   explicitamente. Como cada casa tem endereço próprio, isso é canal de
   aquisição real — e o Next.js já entrega quase de graça.

4. **Verificação do pedido no balcão.** O QR aponta para uma URL que "o
   atendente lê no balcão", mas não há tela, rota nem produto do lado do
   restaurante — e o MVP nem assina essa URL de verdade (DP-16). Vale
   explicitar que o MVP entrega só a metade do cliente.
