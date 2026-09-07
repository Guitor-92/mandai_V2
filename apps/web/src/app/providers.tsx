"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/modules/cart/context";
import { ChangeRestaurantDialog } from "@/modules/cart/components/ChangeRestaurantDialog";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {children}
        <ChangeRestaurantDialog />
      </CartProvider>
    </QueryClientProvider>
  );
}
