import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/legal";

export const Route = createFileRoute("/delivery")({
  component: Delivery,
  head: () => ({ meta: [{ title: "Оплата та доставка" }] }),
});

function Delivery() {
  return (
    <Legal title="Оплата та доставка">
      <p>Оплата — при отриманні у відділенні або поштоматі Нової Пошти. Передоплати немає.</p>
      <p>Після заявки менеджер телефонує, уточнює місто, відділення і кількість упаковок.</p>
      <p>Відправка по Україні. Термін у дорозі зазвичай 1–3 дні, залежить від відділення.</p>
      <p>
        Одна упаковка (12 таблеток) — 299 грн. За 2, 3 і 4 упаковки діє знижка, сума вказана на
        сторінці замовлення.
      </p>
    </Legal>
  );
}
