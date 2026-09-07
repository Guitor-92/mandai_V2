import { notFound } from "next/navigation";
import { ApiError } from "@/shared/lib/api";
import { getOrderByCode } from "@/modules/orders/services/orders.api";
import { OrderConfirmationView } from "@/modules/orders/components/OrderConfirmationView";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  let order;
  try {
    order = await getOrderByCode(codigo);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) notFound();
    throw err;
  }

  return (
    <section className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <OrderConfirmationView order={order} />
    </section>
  );
}
