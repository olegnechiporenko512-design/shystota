import { env } from "@/lib/env.server";

const PIXEL_ID = "1749190629525376";

export type CapiInput = {
  orderId: string;
  page: string;
  name: string;
  phone: string;
  total: number;
  variant: string;
  ip: string;
  userAgent: string;
  fbp: string;
  fbc: string;
  fbclid: string;
};

export function makeOrderId(): string {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}`;
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `${stamp}-${rand}`;
}

async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Browser eventID and this event_id are the same orderId. */
export async function sendMetaCapi(input: CapiInput): Promise<void> {
  const token = env("META_CAPI_TOKEN");
  if (!token) return;
  try {
    const ph = await sha256(input.phone);
    const fn = await sha256(input.name.trim().toLowerCase());
    const fbc = input.fbc || (input.fbclid ? `fb.1.${Date.now()}.${input.fbclid}` : "");
    const userData: Record<string, unknown> = { ph: [ph], fn: [fn] };
    if (input.ip) userData.client_ip_address = input.ip;
    if (input.userAgent) userData.client_user_agent = input.userAgent;
    if (input.fbp) userData.fbp = input.fbp;
    if (fbc) userData.fbc = fbc;
    const eventTime = Math.floor(Date.now() / 1000);
    const customData = { value: input.total, currency: "UAH", content_name: input.variant };
    const base = {
      event_time: eventTime,
      event_id: input.orderId,
      action_source: "website",
      event_source_url: input.page || undefined,
      user_data: userData,
      custom_data: customData,
    };
    const body: Record<string, unknown> = {
      data: [
        { ...base, event_name: "Lead" },
        { ...base, event_name: "Purchase" },
      ],
    };
    const test = env("META_TEST_EVENT_CODE");
    if (test) body.test_event_code = test;
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[capi] failed", res.status, text.slice(0, 400));
    }
  } catch (error) {
    console.error("[capi] error", error instanceof Error ? error.message : "unknown");
  }
}
