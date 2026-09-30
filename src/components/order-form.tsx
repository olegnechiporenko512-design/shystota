import { useId, useRef, useState, type FormEvent } from "react";
import { Phone, User } from "lucide-react";
import { readAttribution } from "@/lib/attribution";
import { OFFERS, type Offer } from "@/lib/offers";
import { formatUaPhone, isValidName, normalizeUaPhone } from "@/lib/phone";

type LeadResponse = {
  success?: boolean;
  order_id?: string;
  error?: string;
};

function messageFor(code: string | undefined): string {
  if (code === "bad_name") return "Вкажіть ім’я — щонайменше 2 символи.";
  if (code === "bad_phone") return "Перевірте номер — має бути 9 цифр після +380.";
  if (code === "rate") return "Забагато спроб. Зачекайте кілька хвилин і спробуйте ще раз.";
  return "Не вдалося відправити, спробуйте ще раз";
}

const PRODUCT_NAME = "Аквакристал — таблетки для пральних машин";

function readCookie(name: string): string {
  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const item = part.trim();
    if (item.startsWith(prefix)) return decodeURIComponent(item.slice(prefix.length));
  }
  return "";
}

export function OrderForm({
  offer,
  onOffer,
}: {
  offer: Offer;
  onOffer: (offer: Offer) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+380 ");
  const [website, setWebsite] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ name: string; offer: Offer } | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const phoneId = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || done) return;
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (!isValidName(cleanName)) {
      setError(messageFor("bad_name"));
      nameRef.current?.focus();
      return;
    }
    if (!normalizeUaPhone(phone)) {
      setError(messageFor("bad_phone"));
      phoneRef.current?.focus();
      return;
    }
    setError("");
    setPending(true);
    const attr = readAttribution();
    const payload = {
      name: cleanName,
      phone: normalizeUaPhone(phone) ?? phone,
      quantity: offer.quantity,
      variant: offer.variant,
      total: offer.total,
      page: window.location.href,
      fbp: readCookie("_fbp"),
      fbc: readCookie("_fbc"),
      website,
      utm_source: attr.utm_source,
      utm_medium: attr.utm_medium,
      utm_campaign: attr.utm_campaign,
      utm_content: attr.utm_content,
      utm_term: attr.utm_term,
      fbclid: attr.fbclid,
      ttclid: attr.ttclid,
      gclid: attr.gclid,
    };
    let leave = false;
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as LeadResponse;
      if (data.success === true && data.order_id) {
        const canonical = normalizeUaPhone(phone) ?? "";
        try {
          sessionStorage.setItem(
            "dyakuiemo_order",
            JSON.stringify({
              order_id: data.order_id,
              name: cleanName,
              phone: canonical,
              variant: offer.variant,
              quantity: offer.quantity,
              total: offer.total,
              product: PRODUCT_NAME,
            }),
          );
        } catch {
          /* storage blocked */
        }
        leave = true;
        window.location.assign("/dyakuiemo");
        return;
      }
      if (data.success === true) {
        leave = true;
        window.location.assign("/dyakuiemo");
        return;
      }
      setError(messageFor(data.error));
    } catch {
      setError(messageFor(undefined));
    } finally {
      if (!leave) setPending(false);
    }
  }

  if (done) {
    return (
      <div className="thanks" role="status">
        <h2>Дякуємо, {done.name.split(" ")[0]}!</h2>
        <p>
          Заявку прийнято. Менеджер зателефонує, щоб підтвердити доставку Новою Поштою. Оплата —
          лише коли заберете посилку.
        </p>
        <dl>
          <div>
            <dt>Варіант</dt>
            <dd>{done.offer.variant}</dd>
          </div>
          <div>
            <dt>До відправки</dt>
            <dd>
              {done.offer.quantity} уп. · {done.offer.quantity * 12} таблеток
            </dd>
          </div>
          <div>
            <dt>Сума</dt>
            <dd>{done.offer.total} грн</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <form className="proxy-form" onSubmit={onSubmit} noValidate>
      <div className="qty-label">Оберіть кількість:</div>
      <div className="qty-cards-scroll" role="radiogroup" aria-label="Кількість">
        {OFFERS.map((item) => (
          <button
            key={item.quantity}
            type="button"
            role="radio"
            aria-checked={item.quantity === offer.quantity}
            className={`qty-card-item${item.quantity === offer.quantity ? " active" : ""}`}
            onClick={() => onOffer(item)}
          >
            {item.off > 0 && item.quantity > 1 ? <span className="qci-badge">-{item.off}%</span> : null}
            <span className="qci-count">{item.label}</span>
            <span className="qci-price">{item.total} ₴</span>
          </button>
        ))}
      </div>
      <div className="inp-wrap">
        <span className="inp-icon" aria-hidden="true">
          <User size={18} />
        </span>
        <input
          ref={nameRef}
          id={nameId}
          className="heavy-input"
          name="name"
          autoComplete="name"
          placeholder="Ваше Ім'я"
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="inp-wrap">
        <span className="inp-icon" aria-hidden="true">
          <Phone size={18} />
        </span>
        <input
          ref={phoneRef}
          id={phoneId}
          className="heavy-input"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+380 67 123 45 67"
          maxLength={20}
          value={phone}
          onChange={(event) => setPhone(formatUaPhone(event.target.value))}
          required
        />
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Сайт</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>
      <button className="btn-liquid-text" type="submit" disabled={pending}>
        <span className="blt-text">{pending ? "НАДСИЛАЄМО…" : "ОФОРМИТИ ЗАМОВЛЕННЯ"}</span>
      </button>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
