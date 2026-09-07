// Fonte única de dados de demonstração do Mandaí.
//
// Espelha os nomes, preços e fotos (Unsplash) que aparecem em
// design_handoff_mandai_web/src/screen-*.jsx. É consumido por:
//   - prisma/seed.ts            (grava no Postgres via Prisma)
//   - infra/in-memory-*.repository.ts (usado quando não há DATABASE_URL)
//
// Por isso o shape aqui é "quase Prisma": ids explícitos e estrutura aninhada
// pronta para um `create` com nested writes, mas sem nenhum import de Prisma —
// é só dado.

export type MenuItemAvailability = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface SeedModifierOption {
  id: string;
  name: string;
  priceDelta: number;
  available: boolean;
  position: number;
}

export interface SeedModifierGroup {
  id: string;
  name: string;
  helperText: string;
  minSelect: number;
  maxSelect: number;
  position: number;
  options: SeedModifierOption[];
}

export interface SeedMenuItem {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  availability: MenuItemAvailability;
  isPopular: boolean;
  promoLabel: string | null;
  modifierGroups: SeedModifierGroup[];
}

export interface SeedMenuSection {
  id: string;
  name: string;
  position: number;
  items: SeedMenuItem[];
}

export interface SeedOpeningHour {
  id: string;
  dayOfWeek: number; // 0=domingo .. 6=sábado
  opensAtMinutes: number;
  closesAtMinutes: number;
}

export interface SeedRestaurant {
  id: string;
  slug: string;
  name: string;
  category: string;
  tags: string;
  rating: number;
  reviewCount: number;
  distanceMeters: number;
  prepTimeMinutes: number;
  isOpen: boolean;
  coverUrl: string;
  logoUrl: string;
  addressLine: string;
  neighborhood: string;
  city: string;
  phone: string;
  openingHours: SeedOpeningHour[];
  sections: SeedMenuSection[];
}

export interface SeedCoupon {
  code: string;
  label: string;
  percentOff: number | null;
  amountOffCents: number | null;
  minSubtotal: number;
  expiresAt: string; // ISO
  active: boolean;
}

const unsplash = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const restaurants: SeedRestaurant[] = [
  // ───────────────────────── Padaria do Zé ─────────────────────────
  // Flagship do handoff: aparece no cardápio (03), no modal (04), na
  // sacola (05), na confirmação (06) e no estado de item esgotado (08).
  {
    id: 'rest_padaria_ze',
    slug: 'padaria-do-ze',
    name: 'Padaria do Zé',
    category: 'padaria',
    tags: 'Padaria · Café · Brunch',
    rating: 4.8,
    reviewCount: 1247,
    distanceMeters: 1200,
    prepTimeMinutes: 18,
    isOpen: true,
    coverUrl: unsplash('1509440159596-0249088772ff', 1600),
    logoUrl: unsplash('1509440159596-0249088772ff', 300),
    addressLine: 'R. Wisard, 348',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    phone: '(11) 2389-0042',
    openingHours: [
      { id: 'oh_ze_1', dayOfWeek: 1, opensAtMinutes: 420, closesAtMinutes: 780 },
      { id: 'oh_ze_2', dayOfWeek: 2, opensAtMinutes: 420, closesAtMinutes: 780 },
      { id: 'oh_ze_3', dayOfWeek: 3, opensAtMinutes: 420, closesAtMinutes: 780 },
      { id: 'oh_ze_4', dayOfWeek: 4, opensAtMinutes: 420, closesAtMinutes: 780 },
      { id: 'oh_ze_5', dayOfWeek: 5, opensAtMinutes: 420, closesAtMinutes: 780 },
      { id: 'oh_ze_6', dayOfWeek: 6, opensAtMinutes: 420, closesAtMinutes: 840 },
      // domingo fechado — sem faixa de horário.
    ],
    sections: [
      {
        id: 'sec_ze_mais_pedidos',
        name: 'Mais pedidos da casa',
        position: 0,
        items: [
          {
            id: 'item_ze_tapioca',
            name: 'Tapioca de queijo coalho',
            description:
              'Tapioca feita na hora, recheada com queijo coalho derretido. Acompanha potinho de mel da casa pra você regar do jeito que gosta.',
            priceCents: 1890,
            imageUrl: unsplash('1639024471283-03518883512d', 800),
            availability: 'AVAILABLE',
            isPopular: true,
            promoLabel: null,
            modifierGroups: [
              {
                id: 'mg_tapioca_acompanhamento',
                name: 'Escolha o acompanhamento',
                helperText: 'Escolha 1 opção',
                minSelect: 1,
                maxSelect: 1,
                position: 0,
                options: [
                  { id: 'mo_tapioca_mel', name: 'Mel da casa', priceDelta: 0, available: true, position: 0 },
                  { id: 'mo_tapioca_geleia', name: 'Geléia de pimenta artesanal', priceDelta: 300, available: true, position: 1 },
                  { id: 'mo_tapioca_doce_leite', name: 'Doce de leite cremoso', priceDelta: 400, available: true, position: 2 },
                ],
              },
              {
                id: 'mg_tapioca_adicionais',
                name: 'Adicionais',
                helperText: 'Quantos quiser',
                minSelect: 0,
                maxSelect: 4,
                position: 1,
                options: [
                  { id: 'mo_tapioca_queijo_extra', name: 'Queijo coalho extra', priceDelta: 500, available: true, position: 0 },
                  { id: 'mo_tapioca_manteiga_terra', name: 'Manteiga da terra', priceDelta: 250, available: true, position: 1 },
                  { id: 'mo_tapioca_carne_sol', name: 'Carne de sol desfiada', priceDelta: 900, available: true, position: 2 },
                  { id: 'mo_tapioca_coco', name: 'Coco ralado', priceDelta: 150, available: true, position: 3 },
                ],
              },
            ],
          },
          {
            id: 'item_ze_pao_chapa',
            name: 'Pão na chapa com manteiga',
            description: 'Pão francês fresquinho, manteiga derretida na chapa quente.',
            priceCents: 650,
            imageUrl: unsplash('1509440159596-0249088772ff', 800),
            availability: 'OUT_OF_STOCK',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_ze_misto',
            name: 'Misto quente clássico',
            description: 'Pão de forma, presunto, queijo prato. Do jeito que tem que ser.',
            priceCents: 1290,
            imageUrl: unsplash('1528735602780-2552fd46c7af', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
      {
        id: 'sec_ze_paes_bolos',
        name: 'Pães e bolos',
        position: 1,
        items: [
          {
            id: 'item_ze_pao_queijo',
            name: 'Pão de queijo (un.)',
            description: 'Massa de queijo da serra, assado na hora.',
            priceCents: 450,
            imageUrl: unsplash('1509440159596-0249088772ff', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_ze_bolo_fuba',
            name: 'Bolo de fubá',
            description: 'Fofinho, com casquinha de açúcar e erva-doce.',
            priceCents: 890,
            imageUrl: unsplash('1639024471283-03518883512d', 800),
            availability: 'LOW_STOCK',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_ze_croissant_manteiga',
            name: 'Croissant de manteiga',
            description: 'Massa folhada francesa, assada de manhã cedinho.',
            priceCents: 1200,
            imageUrl: unsplash('1565299624946-b28f40a0ae38', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
      {
        id: 'sec_ze_cafes',
        name: 'Cafés da manhã',
        position: 2,
        items: [
          {
            id: 'item_ze_cafe_leite',
            name: 'Café com leite e pão na chapa',
            description: 'O combo da padaria. Café coado, leite quentinho.',
            priceCents: 1490,
            imageUrl: unsplash('1495474472287-4d71bcdd2085', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [
              {
                id: 'mg_cafe_leite_tipo',
                name: 'Tipo de leite',
                helperText: 'Escolha 1 opção',
                minSelect: 0,
                maxSelect: 1,
                position: 0,
                options: [
                  { id: 'mo_cafe_leite_integral', name: 'Leite integral', priceDelta: 0, available: true, position: 0 },
                  { id: 'mo_cafe_leite_zero_lactose', name: 'Leite zero lactose', priceDelta: 0, available: true, position: 1 },
                  { id: 'mo_cafe_leite_amendoas', name: 'Leite de amêndoas', priceDelta: 300, available: true, position: 2 },
                ],
              },
            ],
          },
          {
            id: 'item_ze_suco_laranja',
            name: 'Suco de laranja 400ml',
            description: 'Espremido na hora, sem açúcar, sem nada.',
            priceCents: 1000,
            imageUrl: unsplash('1613478223719-2ab802602423', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_ze_croissant_casa',
            name: 'Croissant da casa',
            description: 'Manteiga francesa, massa folhada feita aqui.',
            priceCents: 990,
            imageUrl: unsplash('1555507036-ab1f4038808a', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
      {
        id: 'sec_ze_brunch',
        name: 'Brunch',
        position: 3,
        items: [
          {
            id: 'item_ze_acai',
            name: 'Açaí 500ml na tigela',
            description: 'Banana, granola crocante, leite condensado.',
            priceCents: 2290,
            imageUrl: unsplash('1490474418585-ba9bad8fd0ea', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: '10% off',
            modifierGroups: [],
          },
          {
            id: 'item_ze_ovos',
            name: 'Ovos mexidos com bacon',
            description: 'Ovos cremosos, bacon crocante, torrada.',
            priceCents: 2650,
            imageUrl: unsplash('1525351484163-7529414344d8', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
    ],
  },

  // ───────────────────────── Napoli Pizza Bar ─────────────────────────
  {
    id: 'rest_napoli',
    slug: 'napoli-pizza-bar',
    name: 'Napoli Pizza Bar',
    category: 'pizza',
    tags: 'Pizza · Italiana',
    rating: 4.9,
    reviewCount: 982,
    distanceMeters: 1500,
    prepTimeMinutes: 25,
    isOpen: true,
    coverUrl: unsplash('1513104890138-7c749659a591', 1600),
    logoUrl: unsplash('1513104890138-7c749659a591', 300),
    addressLine: 'R. Harmonia, 120',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    phone: '(11) 3021-5567',
    openingHours: [
      { id: 'oh_napoli_1', dayOfWeek: 2, opensAtMinutes: 1080, closesAtMinutes: 1380 },
      { id: 'oh_napoli_2', dayOfWeek: 3, opensAtMinutes: 1080, closesAtMinutes: 1380 },
      { id: 'oh_napoli_3', dayOfWeek: 4, opensAtMinutes: 1080, closesAtMinutes: 1380 },
      { id: 'oh_napoli_4', dayOfWeek: 5, opensAtMinutes: 1080, closesAtMinutes: 1440 },
      { id: 'oh_napoli_5', dayOfWeek: 6, opensAtMinutes: 1080, closesAtMinutes: 1440 },
      { id: 'oh_napoli_6', dayOfWeek: 0, opensAtMinutes: 1080, closesAtMinutes: 1380 },
    ],
    sections: [
      {
        id: 'sec_napoli_pizzas',
        name: 'Pizzas',
        position: 0,
        items: [
          {
            id: 'item_napoli_margherita',
            name: 'Pizza Margherita',
            description: 'Molho de tomate San Marzano, muçarela de búfala, manjericão fresco.',
            priceCents: 3990,
            imageUrl: unsplash('1513104890138-7c749659a591', 800),
            availability: 'AVAILABLE',
            isPopular: true,
            promoLabel: null,
            modifierGroups: [
              {
                id: 'mg_margherita_tamanho',
                name: 'Tamanho',
                helperText: 'Escolha 1 opção',
                minSelect: 1,
                maxSelect: 1,
                position: 0,
                options: [
                  { id: 'mo_margherita_broto', name: 'Broto', priceDelta: 0, available: true, position: 0 },
                  { id: 'mo_margherita_media', name: 'Média', priceDelta: 1200, available: true, position: 1 },
                  { id: 'mo_margherita_grande', name: 'Grande', priceDelta: 2200, available: true, position: 2 },
                ],
              },
              {
                id: 'mg_margherita_borda',
                name: 'Borda recheada',
                helperText: 'Escolha 1 opção',
                minSelect: 0,
                maxSelect: 1,
                position: 1,
                options: [
                  { id: 'mo_margherita_sem_borda', name: 'Sem borda', priceDelta: 0, available: true, position: 0 },
                  { id: 'mo_margherita_borda_catupiry', name: 'Borda de catupiry', priceDelta: 800, available: true, position: 1 },
                  { id: 'mo_margherita_borda_cheddar', name: 'Borda de cheddar', priceDelta: 800, available: true, position: 2 },
                ],
              },
            ],
          },
          {
            id: 'item_napoli_calabresa',
            name: 'Pizza Calabresa',
            description: 'Calabresa fatiada, cebola roxa, azeitonas pretas.',
            priceCents: 4290,
            imageUrl: unsplash('1513104890138-7c749659a591', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_napoli_quatro_queijos',
            name: 'Pizza Quatro Queijos',
            description: 'Muçarela, provolone, gorgonzola e parmesão.',
            priceCents: 4590,
            imageUrl: unsplash('1513104890138-7c749659a591', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
      {
        id: 'sec_napoli_bebidas',
        name: 'Bebidas',
        position: 1,
        items: [
          {
            id: 'item_napoli_refri',
            name: 'Refrigerante lata 350ml',
            description: 'Gelado, do jeito que tem que ser.',
            priceCents: 700,
            imageUrl: unsplash('1613478223719-2ab802602423', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_napoli_suco_uva',
            name: 'Suco de uva 500ml',
            description: 'Suco integral, sem adição de açúcar.',
            priceCents: 1200,
            imageUrl: unsplash('1613478223719-2ab802602423', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
    ],
  },

  // ───────────────────────── Tomie Sushi ─────────────────────────
  {
    id: 'rest_tomie',
    slug: 'tomie-sushi',
    name: 'Tomie Sushi',
    category: 'japa',
    tags: 'Japonesa · Combinados',
    rating: 4.7,
    reviewCount: 764,
    distanceMeters: 2400,
    prepTimeMinutes: 30,
    isOpen: true,
    coverUrl: unsplash('1579871494447-9811cf80d66c', 1600),
    logoUrl: unsplash('1579871494447-9811cf80d66c', 300),
    addressLine: 'R. Fradique Coutinho, 990',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    phone: '(11) 3819-2245',
    openingHours: [
      { id: 'oh_tomie_1', dayOfWeek: 2, opensAtMinutes: 720, closesAtMinutes: 1350 },
      { id: 'oh_tomie_2', dayOfWeek: 3, opensAtMinutes: 720, closesAtMinutes: 1350 },
      { id: 'oh_tomie_3', dayOfWeek: 4, opensAtMinutes: 720, closesAtMinutes: 1350 },
      { id: 'oh_tomie_4', dayOfWeek: 5, opensAtMinutes: 720, closesAtMinutes: 1380 },
      { id: 'oh_tomie_5', dayOfWeek: 6, opensAtMinutes: 720, closesAtMinutes: 1380 },
      { id: 'oh_tomie_6', dayOfWeek: 0, opensAtMinutes: 720, closesAtMinutes: 1320 },
    ],
    sections: [
      {
        id: 'sec_tomie_combinados',
        name: 'Combinados',
        position: 0,
        items: [
          {
            id: 'item_tomie_combinado_salmao',
            name: 'Combinado Salmão 20 peças',
            description: 'Sashimi, niguiri e uramaki de salmão.',
            priceCents: 5990,
            imageUrl: unsplash('1579871494447-9811cf80d66c', 800),
            availability: 'AVAILABLE',
            isPopular: true,
            promoLabel: null,
            modifierGroups: [
              {
                id: 'mg_combinado_molho',
                name: 'Molho extra',
                helperText: 'Quantos quiser',
                minSelect: 0,
                maxSelect: 2,
                position: 0,
                options: [
                  { id: 'mo_combinado_shoyu', name: 'Shoyu', priceDelta: 0, available: true, position: 0 },
                  { id: 'mo_combinado_tare', name: 'Tarê', priceDelta: 300, available: true, position: 1 },
                  { id: 'mo_combinado_gergelim', name: 'Molho de gergelim', priceDelta: 300, available: true, position: 2 },
                ],
              },
            ],
          },
          {
            id: 'item_tomie_combinado_veggie',
            name: 'Combinado Sushi Vegetariano 16 peças',
            description: 'Uramakis de pepino, manga e cream cheese.',
            priceCents: 4490,
            imageUrl: unsplash('1579871494447-9811cf80d66c', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
      {
        id: 'sec_tomie_individuais',
        name: 'Individuais',
        position: 1,
        items: [
          {
            id: 'item_tomie_uramaki_phila',
            name: 'Uramaki Philadelphia 8un',
            description: 'Salmão, cream cheese, cebolinha.',
            priceCents: 2890,
            imageUrl: unsplash('1579871494447-9811cf80d66c', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_tomie_hot_roll',
            name: 'Hot roll salmão 8un',
            description: 'Empanado e frito na hora, recheio de salmão e cream cheese.',
            priceCents: 3190,
            imageUrl: unsplash('1579871494447-9811cf80d66c', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_tomie_temaki',
            name: 'Temaki de salmão',
            description: 'Alga, arroz temperado, salmão fresco.',
            priceCents: 2490,
            imageUrl: unsplash('1579871494447-9811cf80d66c', 800),
            availability: 'LOW_STOCK',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
    ],
  },

  // ───────────────────────── Burgão da Esquina ─────────────────────────
  {
    id: 'rest_burgao',
    slug: 'burgao-da-esquina',
    name: 'Burgão da Esquina',
    category: 'burger',
    tags: 'Hambúrguer · Batata frita',
    rating: 4.6,
    reviewCount: 1103,
    distanceMeters: 1800,
    prepTimeMinutes: 22,
    isOpen: true,
    coverUrl: unsplash('1568901346375-23c9450c58cd', 1600),
    logoUrl: unsplash('1568901346375-23c9450c58cd', 300),
    addressLine: 'R. Aspicuelta, 210',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    phone: '(11) 3032-8871',
    openingHours: [
      { id: 'oh_burgao_1', dayOfWeek: 1, opensAtMinutes: 1080, closesAtMinutes: 1410 },
      { id: 'oh_burgao_2', dayOfWeek: 2, opensAtMinutes: 1080, closesAtMinutes: 1410 },
      { id: 'oh_burgao_3', dayOfWeek: 3, opensAtMinutes: 1080, closesAtMinutes: 1410 },
      { id: 'oh_burgao_4', dayOfWeek: 4, opensAtMinutes: 1080, closesAtMinutes: 1410 },
      { id: 'oh_burgao_5', dayOfWeek: 5, opensAtMinutes: 1080, closesAtMinutes: 1440 },
      { id: 'oh_burgao_6', dayOfWeek: 6, opensAtMinutes: 1080, closesAtMinutes: 1440 },
      { id: 'oh_burgao_7', dayOfWeek: 0, opensAtMinutes: 1080, closesAtMinutes: 1380 },
    ],
    sections: [
      {
        id: 'sec_burgao_burgers',
        name: 'Burgers',
        position: 0,
        items: [
          {
            id: 'item_burgao_cheeseburger',
            name: 'Cheeseburger Artesanal',
            description: 'Blend 160g, queijo cheddar, picles e molho da casa.',
            priceCents: 2890,
            imageUrl: unsplash('1568901346375-23c9450c58cd', 800),
            availability: 'AVAILABLE',
            isPopular: true,
            promoLabel: null,
            modifierGroups: [
              {
                id: 'mg_cheeseburger_ponto',
                name: 'Ponto da carne',
                helperText: 'Escolha 1 opção',
                minSelect: 1,
                maxSelect: 1,
                position: 0,
                options: [
                  { id: 'mo_cheeseburger_ao_ponto', name: 'Ao ponto', priceDelta: 0, available: true, position: 0 },
                  { id: 'mo_cheeseburger_bem_passado', name: 'Bem passado', priceDelta: 0, available: true, position: 1 },
                  { id: 'mo_cheeseburger_mal_passado', name: 'Mal passado', priceDelta: 0, available: true, position: 2 },
                ],
              },
              {
                id: 'mg_cheeseburger_adicionais',
                name: 'Adicionais',
                helperText: 'Quantos quiser',
                minSelect: 0,
                maxSelect: 3,
                position: 1,
                options: [
                  { id: 'mo_cheeseburger_bacon', name: 'Bacon', priceDelta: 500, available: true, position: 0 },
                  { id: 'mo_cheeseburger_ovo', name: 'Ovo', priceDelta: 300, available: true, position: 1 },
                  { id: 'mo_cheeseburger_cheddar_extra', name: 'Cheddar extra', priceDelta: 400, available: true, position: 2 },
                ],
              },
            ],
          },
          {
            id: 'item_burgao_duplo_bacon',
            name: 'Burgão Duplo Bacon',
            description: 'Dois blends de 120g, queijo prato e bacon crocante.',
            priceCents: 3490,
            imageUrl: unsplash('1568901346375-23c9450c58cd', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_burgao_veggie',
            name: 'Veggie Burger',
            description: 'Blend de grão-de-bico e cogumelos, maionese vegana.',
            priceCents: 2690,
            imageUrl: unsplash('1568901346375-23c9450c58cd', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
      {
        id: 'sec_burgao_acompanhamentos',
        name: 'Acompanhamentos',
        position: 1,
        items: [
          {
            id: 'item_burgao_batata',
            name: 'Batata frita grande',
            description: 'Crocante por fora, macia por dentro.',
            priceCents: 1590,
            imageUrl: unsplash('1568901346375-23c9450c58cd', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_burgao_onion_rings',
            name: 'Onion rings',
            description: 'Anéis de cebola empanados, molho barbecue.',
            priceCents: 1490,
            imageUrl: unsplash('1568901346375-23c9450c58cd', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_burgao_milkshake',
            name: 'Milkshake de chocolate',
            description: '400ml, cobertura de calda e chantilly.',
            priceCents: 1690,
            imageUrl: unsplash('1568901346375-23c9450c58cd', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
    ],
  },

  // ───────────────────────── Açaí da Manga ─────────────────────────
  {
    id: 'rest_manga',
    slug: 'acai-da-manga',
    name: 'Açaí da Manga',
    category: 'acai',
    tags: 'Açaí · Sucos · Tigelas',
    rating: 4.8,
    reviewCount: 690,
    distanceMeters: 600,
    prepTimeMinutes: 12,
    isOpen: true,
    coverUrl: unsplash('1490474418585-ba9bad8fd0ea', 1600),
    logoUrl: unsplash('1490474418585-ba9bad8fd0ea', 300),
    addressLine: 'R. Mourato Coelho, 555',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    phone: '(11) 3814-7723',
    openingHours: [
      { id: 'oh_manga_1', dayOfWeek: 1, opensAtMinutes: 540, closesAtMinutes: 1260 },
      { id: 'oh_manga_2', dayOfWeek: 2, opensAtMinutes: 540, closesAtMinutes: 1260 },
      { id: 'oh_manga_3', dayOfWeek: 3, opensAtMinutes: 540, closesAtMinutes: 1260 },
      { id: 'oh_manga_4', dayOfWeek: 4, opensAtMinutes: 540, closesAtMinutes: 1260 },
      { id: 'oh_manga_5', dayOfWeek: 5, opensAtMinutes: 540, closesAtMinutes: 1320 },
      { id: 'oh_manga_6', dayOfWeek: 6, opensAtMinutes: 540, closesAtMinutes: 1320 },
      { id: 'oh_manga_7', dayOfWeek: 0, opensAtMinutes: 540, closesAtMinutes: 1200 },
    ],
    sections: [
      {
        id: 'sec_manga_tigelas',
        name: 'Tigelas',
        position: 0,
        items: [
          {
            id: 'item_manga_acai_tradicional',
            name: 'Açaí tradicional 500ml',
            description: 'Açaí puro batido na hora, base pra você montar do seu jeito.',
            priceCents: 1890,
            imageUrl: unsplash('1490474418585-ba9bad8fd0ea', 800),
            availability: 'AVAILABLE',
            isPopular: true,
            promoLabel: null,
            modifierGroups: [
              {
                id: 'mg_acai_complementos',
                name: 'Complementos',
                helperText: 'Quantos quiser',
                minSelect: 0,
                maxSelect: 5,
                position: 0,
                options: [
                  { id: 'mo_acai_granola', name: 'Granola', priceDelta: 0, available: true, position: 0 },
                  { id: 'mo_acai_banana', name: 'Banana', priceDelta: 0, available: true, position: 1 },
                  { id: 'mo_acai_leite_condensado', name: 'Leite condensado', priceDelta: 150, available: true, position: 2 },
                  { id: 'mo_acai_pacoca', name: 'Paçoca', priceDelta: 150, available: true, position: 3 },
                  { id: 'mo_acai_morango', name: 'Morango', priceDelta: 250, available: true, position: 4 },
                ],
              },
            ],
          },
          {
            id: 'item_manga_acai_fit',
            name: 'Açaí fit (sem açúcar) 500ml',
            description: 'Açaí puro, sem adição de xarope de guaraná.',
            priceCents: 2090,
            imageUrl: unsplash('1490474418585-ba9bad8fd0ea', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
      {
        id: 'sec_manga_sucos',
        name: 'Sucos',
        position: 1,
        items: [
          {
            id: 'item_manga_suco_verde',
            name: 'Suco verde detox 500ml',
            description: 'Couve, limão, gengibre e maçã verde.',
            priceCents: 1290,
            imageUrl: unsplash('1613478223719-2ab802602423', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_manga_suco_morango',
            name: 'Suco de morango 500ml',
            description: 'Morango, água de coco e hortelã.',
            priceCents: 1190,
            imageUrl: unsplash('1613478223719-2ab802602423', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
    ],
  },

  // ───────────────────────── Hortaliça Bistrô ─────────────────────────
  {
    id: 'rest_horta',
    slug: 'hortalica-bistro',
    name: 'Hortaliça Bistrô',
    category: 'saudavel',
    tags: 'Saudável · Veggie',
    rating: 4.7,
    reviewCount: 511,
    distanceMeters: 2100,
    prepTimeMinutes: 28,
    isOpen: true,
    coverUrl: unsplash('1546069901-ba9599a7e63c', 1600),
    logoUrl: unsplash('1546069901-ba9599a7e63c', 300),
    addressLine: 'R. Girassol, 470',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    phone: '(11) 3097-4412',
    openingHours: [
      { id: 'oh_horta_1', dayOfWeek: 1, opensAtMinutes: 660, closesAtMinutes: 1290 },
      { id: 'oh_horta_2', dayOfWeek: 2, opensAtMinutes: 660, closesAtMinutes: 1290 },
      { id: 'oh_horta_3', dayOfWeek: 3, opensAtMinutes: 660, closesAtMinutes: 1290 },
      { id: 'oh_horta_4', dayOfWeek: 4, opensAtMinutes: 660, closesAtMinutes: 1290 },
      { id: 'oh_horta_5', dayOfWeek: 5, opensAtMinutes: 660, closesAtMinutes: 1290 },
    ],
    sections: [
      {
        id: 'sec_horta_pratos',
        name: 'Pratos',
        position: 0,
        items: [
          {
            id: 'item_horta_bowl_quinoa',
            name: 'Bowl de quinoa com grão-de-bico',
            description: 'Quinoa, grão-de-bico assado, legumes salteados, molho tahine.',
            priceCents: 2890,
            imageUrl: unsplash('1546069901-ba9599a7e63c', 800),
            availability: 'AVAILABLE',
            isPopular: true,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_horta_caesar',
            name: 'Salada Caesar vegetariana',
            description: 'Alface, croutons, parmesão, molho caesar sem anchova.',
            priceCents: 2490,
            imageUrl: unsplash('1546069901-ba9599a7e63c', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_horta_wrap_frango',
            name: 'Wrap de frango grelhado',
            description: 'Frango grelhado, folhas verdes, molho de iogurte.',
            priceCents: 2290,
            imageUrl: unsplash('1546069901-ba9599a7e63c', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
      {
        id: 'sec_horta_sucos_chas',
        name: 'Sucos e chás',
        position: 1,
        items: [
          {
            id: 'item_horta_suco_detox',
            name: 'Suco detox verde',
            description: 'Couve, abacaxi, limão e hortelã.',
            priceCents: 1290,
            imageUrl: unsplash('1613478223719-2ab802602423', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_horta_cha_hibisco',
            name: 'Chá gelado de hibisco',
            description: 'Servido com gelo e folhas de hortelã.',
            priceCents: 990,
            imageUrl: unsplash('1613478223719-2ab802602423', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
    ],
  },

  // ───────────────────────── Comida da Vovó ─────────────────────────
  {
    id: 'rest_vovo',
    slug: 'comida-da-vovo',
    name: 'Comida da Vovó',
    category: 'brasileira',
    tags: 'Brasileira · Caseira',
    rating: 4.9,
    reviewCount: 1401,
    distanceMeters: 800,
    prepTimeMinutes: 18,
    isOpen: true,
    coverUrl: unsplash('1604329760661-e71dc83f8f26', 1600),
    logoUrl: unsplash('1604329760661-e71dc83f8f26', 300),
    addressLine: 'R. Purpurina, 88',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    phone: '(11) 3813-5590',
    openingHours: [
      { id: 'oh_vovo_1', dayOfWeek: 1, opensAtMinutes: 660, closesAtMinutes: 960 },
      { id: 'oh_vovo_2', dayOfWeek: 2, opensAtMinutes: 660, closesAtMinutes: 960 },
      { id: 'oh_vovo_3', dayOfWeek: 3, opensAtMinutes: 660, closesAtMinutes: 960 },
      { id: 'oh_vovo_4', dayOfWeek: 4, opensAtMinutes: 660, closesAtMinutes: 960 },
      { id: 'oh_vovo_5', dayOfWeek: 5, opensAtMinutes: 660, closesAtMinutes: 960 },
      { id: 'oh_vovo_6', dayOfWeek: 6, opensAtMinutes: 660, closesAtMinutes: 900 },
    ],
    sections: [
      {
        id: 'sec_vovo_executivos',
        name: 'Pratos executivos',
        position: 0,
        items: [
          {
            id: 'item_vovo_feijoada',
            name: 'Feijoada completa',
            description: 'Feijão preto, carnes nobres, couve, arroz e farofa.',
            priceCents: 3290,
            imageUrl: unsplash('1604329760661-e71dc83f8f26', 800),
            availability: 'AVAILABLE',
            isPopular: true,
            promoLabel: '30% off no almoço',
            modifierGroups: [],
          },
          {
            id: 'item_vovo_frango_quiabo',
            name: 'Frango com quiabo',
            description: 'Frango caipira refogado com quiabo e temperos da casa.',
            priceCents: 2690,
            imageUrl: unsplash('1604329760661-e71dc83f8f26', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_vovo_parmegiana',
            name: 'Bife à parmegiana',
            description: 'Bife empanado, molho de tomate, muçarela gratinada.',
            priceCents: 2990,
            imageUrl: unsplash('1604329760661-e71dc83f8f26', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
      {
        id: 'sec_vovo_acompanhamentos',
        name: 'Acompanhamentos',
        position: 1,
        items: [
          {
            id: 'item_vovo_arroz_feijao',
            name: 'Arroz e feijão',
            description: 'Porção individual, do jeito de sempre.',
            priceCents: 900,
            imageUrl: unsplash('1604329760661-e71dc83f8f26', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_vovo_farofa',
            name: 'Farofa da casa',
            description: 'Farofa de mandioca com bacon e ovos.',
            priceCents: 700,
            imageUrl: unsplash('1604329760661-e71dc83f8f26', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
    ],
  },

  // ───────────────────────── Doce & Companhia ─────────────────────────
  {
    id: 'rest_doce',
    slug: 'doce-e-companhia',
    name: 'Doce & Companhia',
    category: 'doces',
    tags: 'Doces · Confeitaria',
    rating: 4.8,
    reviewCount: 322,
    distanceMeters: 900,
    prepTimeMinutes: 15,
    isOpen: true,
    coverUrl: unsplash('1555507036-ab1f4038808a', 1600),
    logoUrl: unsplash('1555507036-ab1f4038808a', 300),
    addressLine: 'R. Delfina, 210',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    phone: '(11) 3021-9087',
    openingHours: [
      { id: 'oh_doce_1', dayOfWeek: 2, opensAtMinutes: 660, closesAtMinutes: 1200 },
      { id: 'oh_doce_2', dayOfWeek: 3, opensAtMinutes: 660, closesAtMinutes: 1200 },
      { id: 'oh_doce_3', dayOfWeek: 4, opensAtMinutes: 660, closesAtMinutes: 1200 },
      { id: 'oh_doce_4', dayOfWeek: 5, opensAtMinutes: 660, closesAtMinutes: 1200 },
      { id: 'oh_doce_5', dayOfWeek: 6, opensAtMinutes: 660, closesAtMinutes: 1200 },
      { id: 'oh_doce_6', dayOfWeek: 0, opensAtMinutes: 660, closesAtMinutes: 1080 },
    ],
    sections: [
      {
        id: 'sec_doce_doces',
        name: 'Doces',
        position: 0,
        items: [
          {
            id: 'item_doce_brigadeiro',
            name: 'Brigadeiro gourmet (un.)',
            description: 'Chocolate belga, granulado crocante.',
            priceCents: 450,
            imageUrl: unsplash('1555507036-ab1f4038808a', 800),
            availability: 'AVAILABLE',
            isPopular: true,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_doce_bolo_chocolate',
            name: 'Bolo de chocolate (fatia)',
            description: 'Massa fofinha, cobertura de ganache.',
            priceCents: 1290,
            imageUrl: unsplash('1555507036-ab1f4038808a', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_doce_torta_limao',
            name: 'Torta de limão (fatia)',
            description: 'Massa amanteigada, creme de limão, merengue maçaricado.',
            priceCents: 1390,
            imageUrl: unsplash('1555507036-ab1f4038808a', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
    ],
  },

  // ───────────────────────── Empório Suco Bar ─────────────────────────
  // Único restaurante fechado no seed (US-09 / tela 07): abre só à noite.
  {
    id: 'rest_emporio',
    slug: 'emporio-suco-bar',
    name: 'Empório Suco Bar',
    category: 'bebidas',
    tags: 'Sucos · Vitaminas',
    rating: 4.6,
    reviewCount: 208,
    distanceMeters: 1400,
    prepTimeMinutes: 10,
    isOpen: false,
    coverUrl: unsplash('1613478223719-2ab802602423', 1600),
    logoUrl: unsplash('1613478223719-2ab802602423', 300),
    addressLine: 'R. Simpatia, 340',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    phone: '(11) 3675-2201',
    openingHours: [
      { id: 'oh_emporio_1', dayOfWeek: 1, opensAtMinutes: 1080, closesAtMinutes: 1380 },
      { id: 'oh_emporio_2', dayOfWeek: 2, opensAtMinutes: 1080, closesAtMinutes: 1380 },
      { id: 'oh_emporio_3', dayOfWeek: 3, opensAtMinutes: 1080, closesAtMinutes: 1380 },
      { id: 'oh_emporio_4', dayOfWeek: 4, opensAtMinutes: 1080, closesAtMinutes: 1380 },
      { id: 'oh_emporio_5', dayOfWeek: 5, opensAtMinutes: 1080, closesAtMinutes: 1410 },
      { id: 'oh_emporio_6', dayOfWeek: 6, opensAtMinutes: 1080, closesAtMinutes: 1410 },
    ],
    sections: [
      {
        id: 'sec_emporio_sucos',
        name: 'Sucos naturais',
        position: 0,
        items: [
          {
            id: 'item_emporio_suco_laranja',
            name: 'Suco de laranja 500ml',
            description: 'Espremido na hora.',
            priceCents: 1000,
            imageUrl: unsplash('1613478223719-2ab802602423', 800),
            availability: 'AVAILABLE',
            isPopular: true,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_emporio_suco_abacaxi',
            name: 'Suco de abacaxi com hortelã',
            description: 'Refrescante, servido bem gelado.',
            priceCents: 1100,
            imageUrl: unsplash('1613478223719-2ab802602423', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
          {
            id: 'item_emporio_vitamina_banana',
            name: 'Vitamina de banana',
            description: 'Banana, leite e um toque de canela.',
            priceCents: 1200,
            imageUrl: unsplash('1613478223719-2ab802602423', 800),
            availability: 'AVAILABLE',
            isPopular: false,
            promoLabel: null,
            modifierGroups: [],
          },
        ],
      },
    ],
  },
];

export const coupons: SeedCoupon[] = [
  {
    code: 'MANDA20',
    label: '20% off no pedido',
    percentOff: 20,
    amountOffCents: null,
    minSubtotal: 3000,
    expiresAt: '2026-12-31T23:59:59-03:00',
    active: true,
  },
  {
    // Cupom inativo, útil pra exercitar a validação de erro em US-07/US-09.
    code: 'EXPIRADO10',
    label: '10% off (promoção encerrada)',
    percentOff: 10,
    amountOffCents: null,
    minSubtotal: 0,
    expiresAt: '2026-01-01T00:00:00-03:00',
    active: false,
  },
];
