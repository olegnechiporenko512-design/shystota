import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/legal";

export const Route = createFileRoute("/cookies")({
  component: Cookies,
  head: () => ({ meta: [{ title: "Файли cookie" }] }),
});

function Cookies() {
  return (
    <Legal title="Файли cookie">
      <p>
        Сторінка зберігає мітки реклами (utm, fbclid, ttclid, gclid) у sessionStorage браузера, щоб
        передати їх разом із заявкою. Вони живуть, поки відкрита вкладка.
      </p>
      <p>
        Рекламні пікселі TikTok і Facebook можуть ставити власні cookie, щоб рахувати перегляди і
        підтверджені заявки. Подія заявки відправляється лише після успішної відповіді сервера.
      </p>
    </Legal>
  );
}
