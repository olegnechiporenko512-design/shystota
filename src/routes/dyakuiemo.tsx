import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const PIXEL_ID = "1749190629525376";
const ORDER_KEY = "dyakuiemo_order";
const HAS_TIKTOK = true;

type SavedOrder = {
  order_id: string;
  name: string;
  phone: string;
  variant: string;
  quantity: number;
  total: number;
  product: string;
};

export const Route = createFileRoute("/dyakuiemo")({
  head: () => ({
    meta: [{ title: "Дякуємо" }, { name: "robots", content: "noindex" }],
  }),
  component: ThanksPage,
});

function readOrder(): SavedOrder | null {
  try {
    const raw = sessionStorage.getItem(ORDER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<SavedOrder>;
    if (!data || typeof data.order_id !== "string" || !data.order_id) return null;
    if (typeof data.name !== "string" || typeof data.phone !== "string") return null;
    if (typeof data.variant !== "string" || typeof data.total !== "number") return null;
    return {
      order_id: data.order_id,
      name: data.name,
      phone: data.phone,
      variant: data.variant,
      quantity: typeof data.quantity === "number" ? data.quantity : 1,
      total: data.total,
      product: typeof data.product === "string" ? data.product : "",
    };
  } catch {
    return null;
  }
}

function firePixels(order: SavedOrder) {
  const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
  const fn = order.name.trim().toLowerCase();
  try {
    fbq?.("set", "autoConfig", false, PIXEL_ID);
    fbq?.("init", PIXEL_ID, { ph: order.phone, fn });
    fbq?.("track", "PageView");
  } catch {
    /* pixel must not break the page */
  }
  const key = `sent_${order.order_id}`;
  if (localStorage.getItem(key) === "1") return;
  localStorage.setItem(key, "1");
  try {
    fbq?.(
      "track",
      "Lead",
      { value: order.total, currency: "UAH", content_name: order.variant },
      { eventID: order.order_id },
    );
    fbq?.(
      "track",
      "Purchase",
      { value: order.total, currency: "UAH", content_name: order.variant },
      { eventID: order.order_id },
    );
  } catch {
    /* pixel must not break the page */
  }
  if (!HAS_TIKTOK) return;
  const ttq = (
    window as Window & {
      ttq?: {
        identify?: (payload: Record<string, string>) => void;
        track?: (event: string, payload?: Record<string, unknown>, options?: Record<string, unknown>) => void;
      };
    }
  ).ttq;
  try {
    ttq?.identify?.({ phone_number: `+${order.phone}` });
    ttq?.track?.("SubmitForm", { value: order.total, currency: "UAH" }, { event_id: order.order_id });
  } catch {
    /* pixel must not break the page */
  }
}

function ThanksPage() {
  const [order, setOrder] = useState<SavedOrder | null | undefined>(undefined);

  useEffect(() => {
    const saved = readOrder();
    setOrder(saved);
    if (saved) firePixels(saved);
  }, []);

  if (order === undefined) return <main className="thanks-page" />;

  return (
    <main className="thanks-page">
      <div className="thanks" role="status">
        {order ? (
          <>
            <h2>
              Дякуємо, {order.name}! Замовлення №{order.order_id} прийнято
            </h2>
            {order.product ? <p>{order.product}</p> : null}
            <p>{order.variant}</p>
            <p>Сума: {order.total} грн</p>
            <p>
              Менеджер зателефонує найближчим часом для підтвердження. Оплата при отриманні на Новій
              Пошті.
            </p>
          </>
        ) : (
          <>
            <h2>Дякуємо!</h2>
            <p>
              <a href="/">На головну</a>
            </p>
          </>
        )}
      </div>
      <div id="upsell" />
    </main>
  );
}
