"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { Cart, CartItem, AddItemInput } from "@/modules/cart/types";

const STORAGE_KEY = "mandai:cart";

const EMPTY_CART: Cart = {
  restaurantSlug: null,
  restaurantName: null,
  items: [],
  couponCode: undefined,
};

type State = {
  cart: Cart;
  hydrated: boolean;
  // US-10: item de outro restaurante pedindo confirmação antes de trocar a sacola.
  pendingConflict: { fromRestaurant: string; toRestaurant: string; pendingItem: AddItemInput } | null;
};

type Action =
  | { type: "HYDRATE"; cart: Cart }
  | { type: "ADD_ITEM"; input: AddItemInput }
  | { type: "REQUEST_CONFLICT"; fromRestaurant: string; toRestaurant: string; pendingItem: AddItemInput }
  | { type: "CONFIRM_REPLACE" }
  | { type: "CANCEL_CONFLICT" }
  | { type: "UPDATE_LINE"; lineId: string; input: Omit<AddItemInput, "restaurantSlug" | "restaurantName"> }
  | { type: "REMOVE_LINE"; lineId: string }
  | { type: "SET_QTY"; lineId: string; qty: number }
  | { type: "SET_COUPON"; code: string | undefined }
  | { type: "CLEAR" };

// DP-11: cada "Adicionar à sacola" cria uma linha nova — nunca funde com uma
// linha existente, mesmo que prato, modificadores e observação sejam idênticos.
function addItemToCart(cart: Cart, input: AddItemInput): Cart {
  const newItem: CartItem = {
    lineId: crypto.randomUUID(),
    menuItemId: input.menuItemId,
    name: input.name,
    imageUrl: input.imageUrl,
    unitPriceCents: input.unitPriceCents,
    qty: input.qty,
    modifiers: input.modifiers,
    note: input.note,
  };
  return {
    ...cart,
    restaurantSlug: input.restaurantSlug,
    restaurantName: input.restaurantName,
    items: [...cart.items, newItem],
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, cart: action.cart, hydrated: true };

    case "ADD_ITEM": {
      const { cart } = state;
      const isDifferentRestaurant =
        cart.restaurantSlug !== null && cart.restaurantSlug !== action.input.restaurantSlug && cart.items.length > 0;
      if (isDifferentRestaurant) {
        return {
          ...state,
          pendingConflict: {
            fromRestaurant: cart.restaurantName ?? "",
            toRestaurant: action.input.restaurantName,
            pendingItem: action.input,
          },
        };
      }
      return { ...state, cart: addItemToCart(cart, action.input) };
    }

    case "CONFIRM_REPLACE": {
      if (!state.pendingConflict) return state;
      const fresh = addItemToCart(EMPTY_CART, state.pendingConflict.pendingItem);
      return { ...state, cart: fresh, pendingConflict: null };
    }

    case "CANCEL_CONFLICT":
      return { ...state, pendingConflict: null };

    case "UPDATE_LINE": {
      const items = state.cart.items.map((item) =>
        item.lineId === action.lineId
          ? {
              ...item,
              name: action.input.name,
              imageUrl: action.input.imageUrl,
              unitPriceCents: action.input.unitPriceCents,
              qty: action.input.qty,
              modifiers: action.input.modifiers,
              note: action.input.note,
            }
          : item,
      );
      return { ...state, cart: { ...state.cart, items } };
    }

    case "REMOVE_LINE": {
      const items = state.cart.items.filter((item) => item.lineId !== action.lineId);
      const emptied = items.length === 0;
      return {
        ...state,
        cart: {
          ...state.cart,
          items,
          restaurantSlug: emptied ? null : state.cart.restaurantSlug,
          restaurantName: emptied ? null : state.cart.restaurantName,
          couponCode: emptied ? undefined : state.cart.couponCode,
        },
      };
    }

    case "SET_QTY": {
      const items = state.cart.items.map((item) =>
        item.lineId === action.lineId ? { ...item, qty: Math.max(1, Math.min(20, action.qty)) } : item,
      );
      return { ...state, cart: { ...state.cart, items } };
    }

    case "SET_COUPON":
      return { ...state, cart: { ...state.cart, couponCode: action.code } };

    case "CLEAR":
      return { ...state, cart: EMPTY_CART };

    default:
      return state;
  }
}

type CartContextValue = {
  cart: Cart;
  hydrated: boolean;
  itemCount: number;
  pendingConflict: State["pendingConflict"];
  addItem: (input: AddItemInput) => void;
  updateLine: (lineId: string, input: Omit<AddItemInput, "restaurantSlug" | "restaurantName">) => void;
  removeLine: (lineId: string) => void;
  setQty: (lineId: string, qty: number) => void;
  setCouponCode: (code: string | undefined) => void;
  clear: () => void;
  confirmReplace: () => void;
  cancelConflict: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    cart: EMPTY_CART,
    hydrated: false,
    pendingConflict: null,
  });

  // Lê o localStorage só depois de montar no client, pra não divergir do HTML
  // renderizado no servidor (que nunca tem acesso a ele).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", cart: JSON.parse(raw) as Cart });
      else dispatch({ type: "HYDRATE", cart: EMPTY_CART });
    } catch {
      dispatch({ type: "HYDRATE", cart: EMPTY_CART });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
    } catch {
      // localStorage indisponível (modo privado, etc.) — sacola só não persiste.
    }
  }, [state.cart, state.hydrated]);

  const addItem = useCallback((input: AddItemInput) => dispatch({ type: "ADD_ITEM", input }), []);
  const updateLine = useCallback(
    (lineId: string, input: Omit<AddItemInput, "restaurantSlug" | "restaurantName">) =>
      dispatch({ type: "UPDATE_LINE", lineId, input }),
    [],
  );
  const removeLine = useCallback((lineId: string) => dispatch({ type: "REMOVE_LINE", lineId }), []);
  const setQty = useCallback((lineId: string, qty: number) => dispatch({ type: "SET_QTY", lineId, qty }), []);
  const setCouponCode = useCallback((code: string | undefined) => dispatch({ type: "SET_COUPON", code }), []);
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const confirmReplace = useCallback(() => dispatch({ type: "CONFIRM_REPLACE" }), []);
  const cancelConflict = useCallback(() => dispatch({ type: "CANCEL_CONFLICT" }), []);

  const itemCount = useMemo(
    () => state.cart.items.reduce((sum, item) => sum + item.qty, 0),
    [state.cart.items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart: state.cart,
      hydrated: state.hydrated,
      itemCount,
      pendingConflict: state.pendingConflict,
      addItem,
      updateLine,
      removeLine,
      setQty,
      setCouponCode,
      clear,
      confirmReplace,
      cancelConflict,
    }),
    [state.cart, state.hydrated, state.pendingConflict, itemCount, addItem, updateLine, removeLine, setQty, setCouponCode, clear, confirmReplace, cancelConflict],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
