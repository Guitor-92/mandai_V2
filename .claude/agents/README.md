# Agent Team — `mandaí-development-team`

Time de agentes que constrói e mantém o Mandaí a partir dos artefatos de
`docs/` (ERD, user stories, ADRs), do `ARQUITETURA.md` na raiz e do
`design_handoff_mandai_web/`.

| Agente | Papel | Modelo | Escreve em |
|---|---|---|---|
| [`product-owner-agent`](product-owner-agent.md) | Product Owner — escopo, ambiguidades, conflitos de requisito | Sonnet | `docs/user-stories/`, `docs/decisoes-produto.md` |
| [`architect-agent`](architect-agent.md) | Arquiteto — decisões técnicas e conformidade | Sonnet | `docs/adr/` |
| [`backend-agent`](backend-agent.md) | Backend Developer | Sonnet | `apps/api/`, `docs/erd.md` |
| [`frontend-agent`](frontend-agent.md) | Frontend Developer | Sonnet | `apps/web/` |
| [`lead-agent`](lead-agent.md) | Tech Lead — coordenação e release report | Sonnet | `docs/release/` |

## Fluxo

```
        ┌──────────────────────┐
        │  product-owner-agent │◄──── dúvidas de negócio
        └──────────┬───────────┘
                   │ escopo, ambiguidades resolvidas
        ┌──────────▼───────────┐
        │    architect-agent   │◄──── dúvidas técnicas
        └─────┬──────────┬─────┘
       ADRs   │          │   ADRs
        ┌─────▼────┐ ┌───▼──────────┐
        │ backend  │◄┤   frontend   │  contrato de API
        │  agent   ├►│    agent     │
        └─────┬────┘ └───┬──────────┘
              └────┬─────┘
           ┌───────▼────────┐
           │   lead-agent   │ → docs/release/0_1_0.md
           └────────────────┘
```

## Regras de fronteira (evitam conflito de escrita)

- Só o `architect-agent` cria/edita arquivos em `docs/adr/`.
- Só o `product-owner-agent` edita `docs/user-stories/`.
- Só o `backend-agent` toca `apps/api/` e `docs/erd.md` (regra de manutenção do
  `CLAUDE.md`: mexeu no `schema.prisma`, mexeu no `erd.md`).
- Só o `frontend-agent` toca `apps/web/`.
- `design_handoff_mandai_web/` é **read-only** para todo mundo.
- Dúvidas em aberto vão para `docs/qa/` (um arquivo por agente que pergunta).
