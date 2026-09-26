import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/legal";

export const Route = createFileRoute("/returns")({
  component: Returns,
  head: () => ({ meta: [{ title: "Повернення товару" }] }),
});

function Returns() {
  return (
    <Legal title="Повернення товару">
      <p>Послуга «Легке повернення» Нової Пошти не підтримується.</p>
      <p>
        Якщо упаковка приїхала пошкодженою або це не той товар, скажіть менеджеру до оплати або одразу
        після огляду. Повернення погоджуємо окремо і підказуємо, як відправити назад.
      </p>
      <p>Відкриту упаковку, з якої вже брали таблетки, назад не приймаємо.</p>
    </Legal>
  );
}
