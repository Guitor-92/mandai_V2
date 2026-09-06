# User Stories — Mandaí

Escopo do MVP derivado do design handoff (`design_handoff_mandai_web/`), do
modelo de domínio (`docs/erd.md`) e do plano de arquitetura (`ARQUITETURA.md`).

O objetivo aqui é **mapear escopo para a conversa de mentoria**, não abastecer
um sprint planning. Por isso não há critérios de aceite detalhados nem
estimativas — cada história diz o que entra, o que não entra e onde a fonte
ainda está ambígua.

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
| [US-07](US-07-aplicar-cupom.md) | Aplicar cupom | `05 · Sacola`, `01 · Home` | **Opcional no MVP** |
| [US-08](US-08-finalizar-e-receber-codigo.md) | Finalizar e receber código | `06 · Pedido confirmado` | MVP |
| [US-09](US-09-lidar-com-estados-de-erro.md) | Lidar com estados de erro | `07 · Restaurante fechado`, `08 · Item esgotado`, `11b · Busca sem resultados`, `10 · Erro` | MVP |
| [US-10](US-10-trocar-de-restaurante-com-sacola.md) | Trocar de restaurante com sacola | *(sem tela desenhada)* | **Opcional no MVP** |

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

- Só quando a fonte for ambígua ou duas fontes se contradisserem.
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

1. **Troca de bairro/endereço de retirada.** O *pickup pill* do header é
   clicável em todas as telas e deveria abrir um modal de troca — o handoff
   admite que essa tela não foi desenhada ("implementar simples"). Hoje o
   bairro está fixo em "Vila Madalena" no navegador, e ele é o recorte de toda
   a descoberta (US-01, US-02, US-03). É a lacuna mais visível do pacote.

2. **Contradição sobre a plataforma.** O overview do handoff descreve o Mandaí
   como "app web **mobile-first**", mas logo abaixo o escopo da entrega diz
   "desktop apenas (1440 px)", e o `ARQUITETURA.md` §11 tira responsividade do
   plano. Para um produto de retirada — usado em pé, na rua, a caminho do
   balcão — vale decidir isso conscientemente e registrar em ADR.

3. **Tela `09 · Login` (v2).** Está desenhada por inteiro, com os benefícios
   prometidos (reordenar em 2 cliques, favoritos, cupons exclusivos) e login
   social. Fora do MVP, mas é o candidato natural a "exercício extra" citado
   no §8 do plano — e destrava o histórico que as telas `05b` e `11b` já
   insinuam ("Pediu na semana passada", buscas recentes).

4. **Coleta de contato para avisos.** "Me avisa quando abrir" (tela `07`) e
   "Me avisa quando voltar" (tela `08`) coletam e-mail ou celular, mas nenhuma
   entidade guarda isso e não há canal de envio. Ou vira uma história própria
   com `StockAlert`, ou os botões saem do MVP.

5. **"Indica um restaurante"** (tela `11b`) é um caminho de aquisição sem
   destino definido — não há formulário, entidade nem processo por trás.

6. **Acessibilidade.** O handoff traz uma seção inteira e bem específica
   (trap de foco no modal, Esc, `aria-label` no QR, seletor de quantidade com
   papel correto, rótulo em todo campo), mas o `ARQUITETURA.md` §11 tira WCAG
   do escopo. As duas fontes discordam; boa parte do que o handoff pede é
   barata se feita desde o começo e cara se deixada para depois.

7. **SEO das páginas de restaurante.** O handoff pede renderização no servidor
   explicitamente. Como cada casa tem endereço próprio, isso é canal de
   aquisição real — e o Next.js já entrega quase de graça.

8. **Paginação.** "Carregar mais pizzarias" (tela `02`) está desenhado e nenhum
   endpoint do plano prevê paginação. O §8 lista paginação como extensão
   pós-MVP.

9. **Verificação do pedido no balcão.** O QR aponta para uma URL assinada que
   "o atendente lê no balcão", mas não há tela, rota nem produto do lado do
   restaurante. Vale explicitar que o MVP entrega só a metade do cliente.

10. **Identificador de restaurante: `slug` ou `id`.** O handoff usa `slug` na
    URL, o `ARQUITETURA.md` §3.1 usa `id`. O `docs/erd.md` já registra isso
    como pendência de ADR — vale ser o primeiro ADR novo, porque afeta rotas,
    endpoints e seed.
