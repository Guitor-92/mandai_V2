import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppHeader } from "@/shared/components/AppHeader";
import { AppFooter } from "@/shared/components/AppFooter";

export const metadata: Metadata = {
  title: "Mandaí — peça e retire no balcão",
  description: "A comida boa do bairro pronta quando você chega. Sem taxa de entrega, código no balcão, pagamento no local.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <AppHeader />
          <main style={{ flex: 1 }}>{children}</main>
          <AppFooter />
        </Providers>
      </body>
    </html>
  );
}
