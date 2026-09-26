import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Flame, ShoppingBag, ThumbsDown, ThumbsUp } from "lucide-react";
import { OrderForm } from "@/components/order-form";
import { OFFERS, type Offer } from "@/lib/offers";

const IMAGES = {
  poster: "/img/poster.jpg",
  problem: "/img/problem.jpg",
  barrier: "/img/barrier.jpg",
  protect: "/img/protect.jpg",
  tiles: "/img/tiles.jpg",
};

type Review = {
  name: string;
  text: string;
  color: string;
  likes: number;
  dislikes: number;
  when: string;
  mine?: boolean;
};

const START_REVIEWS: Review[] = [
  {
    name: "Олена, 41",
    text: "Барабан був у сірому нальоті, рушники пахли затхло. Одна таблетка в порожню машину — метал знову світлий, запах зник.",
    color: "#2196F3",
    likes: 14,
    dislikes: 0,
    when: "2 дні тому",
  },
  {
    name: "Андрій, 38",
    text: "Тен обріс каменем, цикл грів довше. Прогнав Аквакристал на 60°. Наліт зійшов, машина знову гріє як раніше.",
    color: "#009688",
    likes: 9,
    dislikes: 0,
    when: "3 дні тому",
  },
  {
    name: "Марина, 52",
    text: "У манжеті був чорний бруд. Не розбирала машину: таблетка, порожній барабан, і гума стала чистою. Білизна без запаху.",
    color: "#E91E63",
    likes: 6,
    dislikes: 0,
    when: "5 днів тому",
  },
  {
    name: "Ігор, 46",
    text: "Майстер за чистку просив більше, ніж упаковка. 12 таблеток за 299 грн вистачить на рік. Барабан блищить як новий.",
    color: "#FF9800",
    likes: 11,
    dislikes: 0,
    when: "тиждень тому",
  },
];

const FOMO = [
  ["Наталія", "1 упаковку"],
  ["Сергій", "3 упаковки"],
  ["Оксана", "2 упаковки"],
  ["Віталій", "1 упаковку"],
  ["Ірина", "4 упаковки"],
];

const BENEFITS = [
  {
    title: "Видаляє накип",
    desc: "Лимонна кислота і сода розчиняють вапняний наліт на барабані, тені та в патрубках. Солі жорсткості не лишаються кіркою.",
  },
  {
    title: "Усуває запахи",
    desc: "Прибирає бактерії та грибок у манжеті й лотку. Затхлий запах іде разом із брудом, а не маскується ароматизатором.",
  },
  {
    title: "Захищає деталі",
    desc: "Комплекс інгібіторів корозії береже метал. Нагрів не обростає каменем, тож машина служить довше і менше їсть світло.",
  },
  {
    title: "12 таблеток",
    desc: "Однієї упаковки вистачає на рік, якщо чистити раз на місяць. Для дуже жорсткої води зручніше взяти 2–3 упаковки.",
  },
  {
    title: "Без розбору машини",
    desc: "Одна таблетка в порожній барабан і цикл 60° без білизни. Не треба знімати корпус і викликати майстра.",
  },
  {
    title: "Свіжа білизна",
    desc: "Екстракти рослин нейтралізують запах усередині. Після профілактики речі пахнуть чистою тканиною, а не машиною.",
  },
];

const SPECS = [
  ["Бренд", "Аквакристал"],
  ["Форма", "таблетки для очищення"],
  ["В упаковці", "12 таблеток"],
  ["Призначення", "пральні машини-автомат"],
  ["Дія", "накип, бруд, запах, бактерії"],
  ["Склад", "лимонна кислота, ПАВ, сода, екстракти рослин, інгібітори корозії"],
  ["Застосування", "1 таблетка, порожній барабан, 60°"],
];

export function Landing() {
  const [offer, setOffer] = useState<Offer>(OFFERS[0]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [sticky, setSticky] = useState(false);
  const [reviews, setReviews] = useState(START_REVIEWS);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [fomo, setFomo] = useState<{ name: string; what: string; show: boolean } | null>(null);
  const [votes, setVotes] = useState<Record<number, "like" | "dislike" | undefined>>({});

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let hide: number | undefined;
    let index = 0;
    const tick = () => {
      const [name, what] = FOMO[index % FOMO.length];
      index += 1;
      setFomo({ name, what, show: true });
      hide = window.setTimeout(() => setFomo((prev) => (prev ? { ...prev, show: false } : prev)), 4200);
    };
    const first = window.setTimeout(tick, 2500);
    const timer = window.setInterval(tick, 14000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      if (hide) window.clearTimeout(hide);
    };
  }, []);

  function goOrder(next?: Offer) {
    if (next) setOffer(next);
    document.getElementById("order-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function publishReview() {
    const clean = reviewName.trim();
    const text = reviewText.trim();
    if (clean.length < 2 || text.length < 4) return;
    setReviews((list) => [
      {
        name: clean,
        text,
        color: "#0A84FF",
        likes: 0,
        dislikes: 0,
        when: "щойно",
        mine: true,
      },
      ...list,
    ]);
    setReviewName("");
    setReviewText("");
    setReviewOpen(false);
  }

  return (
    <>
      <div className="fixed-background" />
      {fomo ? (
        <div className={`fomo-toast${fomo.show ? " show" : ""}`} role="status">
          <div className="fomo-icon">
            <ShoppingBag size={18} />
          </div>
          <div>
            <div className="fomo-title">{fomo.name}</div>
            <div className="fomo-desc">щойно замовив(ла) {fomo.what}</div>
          </div>
          <div className="fomo-time">щойно</div>
        </div>
      ) : null}
      {lightbox ? (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lb-close" type="button" aria-label="Закрити">
            ×
          </button>
          <img src={lightbox} alt="Збільшене фото таблеток Аквакристал" />
        </div>
      ) : null}

      <div className="mobile-wrapper">
        <section className="hero-card">
          <div className="hero-text-area">
            <h1 className="d7-title">Таблетки для очищення пральних машин</h1>
            <span className="ht-sub">Аквакристал · 12 таблеток в упаковці</span>
          </div>
          <button className="shot-btn" type="button" onClick={() => setLightbox(IMAGES.poster)}>
            <img className="shot" src={IMAGES.poster} alt="Аквакристал — таблетки для очищення пральних машин, 12 штук" />
          </button>
          <div className="hero-content-pad">
            <div className="price-layout">
              <div className="p-left">
                <span className="p-main">299₴</span>
              </div>
              <div className="p-right">
                <span className="p-label-promo">Акційна ціна</span>
                <div className="p-old-row">
                  <span className="p-old">540₴</span>
                  <span className="p-badge">-45%</span>
                </div>
              </div>
            </div>
            <div className="demand-struct">
              <div className="ds-row">
                <Flame size={22} color="#ff5f1f" aria-hidden="true" />
                <div>
                  <div className="ds-title">Високий попит</div>
                  <div className="ds-desc">
                    Залишилось усього <span className="ds-highlight">9 уп</span> за акційною ціною
                  </div>
                </div>
              </div>
              <div className="ds-track">
                <div className="ds-fill" />
              </div>
            </div>
            <button className="btn-liquid-text" type="button" onClick={() => goOrder()}>
              <span className="blt-text">ОФОРМИТИ ЗАМОВЛЕННЯ</span>
            </button>
          </div>
        </section>

        <div className="content-pad">
          <div className="savings-card">
            <div className="sc-header">
              <div className="sc-title-text">Заощаджуй прямо зараз</div>
            </div>
            {OFFERS.filter((item) => item.quantity > 1).map((item) => (
              <button
                key={item.quantity}
                type="button"
                className={`sc-row${item.hit ? " highlight" : ""}`}
                onClick={() => goOrder(item)}
              >
                {item.hit ? <span className="hit-pill">ХІТ</span> : null}
                <span className="sc-content">
                  <span className="sc-qty">{item.label} =</span>
                  <span className="sc-price">{item.total}₴</span>
                  <span className="sc-tag">-{item.off}%</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <section className="hero-card-middle">
          <div className="hero-text-area">
            <h2 className="d7-title">Чому барабан засмічується?</h2>
          </div>
          <div className="section-separator" />
          <div className="hero-content-pad story">
            <h4>Накип, бруд і запах</h4>
            <p>
              З часом на тені й стінках осідає вапно, у манжеті збирається бруд, бактерії і грибок.
              Машина гріє довше, білизна виходить із затхлим запахом, а заміна тена коштує як половина
              нової техніки.
            </p>
            <button className="shot-btn" type="button" onClick={() => setLightbox(IMAGES.problem)}>
              <img src={IMAGES.problem} alt="Забруднений барабан пральної машини: накип і бруд" />
            </button>
            <h4>Як працює таблетка</h4>
            <p>
              Аквакристал — таблетка глибокого очищення. Лимонна кислота і сода розчиняють накип, ПАВ
              знімають жир, екстракти рослин прибирають запах, інгібітори захищають метал.{" "}
              <b>Одна таблетка — і барабан знову як новий.</b>
            </p>
            <button className="shot-btn" type="button" onClick={() => setLightbox(IMAGES.barrier)}>
              <img src={IMAGES.barrier} alt="Барабан до і після однієї таблетки Аквакристал" />
            </button>
            <h4>Результат після циклу</h4>
            <p>
              Кристалево чистий метал, без нальоту і накипу, свіжий аромат і стабільна робота. В
              упаковці <b>12 таблеток</b> — вистачає на регулярну профілактику, і чистка обходиться{" "}
              <b>дешевше за виклик майстра</b>.
            </p>
            <button className="shot-btn" type="button" onClick={() => setLightbox(IMAGES.protect)}>
              <img src={IMAGES.protect} alt="Склад і дія таблеток Аквакристал: накип, запах, захист деталей" />
            </button>
          </div>
        </section>

        <div className="content-pad">
          <h2 className="main-style-heading">Переваги формули</h2>
          <div>
            {BENEFITS.map((item) => (
              <article key={item.title} className="benefit-card">
                <h3 className="ben-title">{item.title}</h3>
                <p className="ben-desc">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>

        <section className="hero-card-middle">
          <div className="hero-text-area">
            <h2 className="d7-title">Характеристики</h2>
          </div>
          <button className="shot-btn" type="button" onClick={() => setLightbox(IMAGES.tiles)}>
            <img className="shot" src={IMAGES.tiles} alt="Упаковка Аквакристал, 12 таблеток для очищення пральних машин" />
          </button>
          <div className="hero-content-pad">
            <div className="specs-list">
              {SPECS.map(([label, value]) => (
                <div className="spec-row" key={label}>
                  <span className="spec-label">{label}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>
            <button className="btn-liquid-text" type="button" style={{ margin: "20px 0 28px" }} onClick={() => goOrder()}>
              <span className="blt-text">ОФОРМИТИ ЗАМОВЛЕННЯ</span>
            </button>
          </div>
        </section>

        <section className="content-pad" id="reviews">
          <h2 className="main-style-heading">Відгуки покупців</h2>
          <div className="trust-dashboard">
            <div className="td-top-row">
              <div className="google-brand">
                <svg className="g-logo-svg" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <div className="g-info">
                  <span className="g-name">Оцінка товару</span>
                  <span className="g-status">
                    <Check size={12} /> Підтверджені замовлення
                  </span>
                </div>
              </div>
              <div>
                <span className="td-score">4.8</span>
                <span className="td-max"> / 5.0</span>
              </div>
            </div>
            <div className="td-bar-bg">
              <div className="td-bar-fill" />
            </div>
            <div className="td-stats">
              <span>Замовлень: 1 284</span>
              <span className="td-green">94% задоволені</span>
            </div>
          </div>

          <button className="write-review-btn" type="button" onClick={() => setReviewOpen((open) => !open)}>
            Написати свій відгук
          </button>
          {reviewOpen ? (
            <div className="review-form">
              <div className="rf-title">Ваша оцінка товару</div>
              <div className="star-select">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`star-s${value <= stars ? " selected" : ""}`}
                    onClick={() => setStars(value)}
                    aria-label={`${value} з 5`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input
                className="rf-input"
                placeholder="Ваше ім’я"
                maxLength={40}
                value={reviewName}
                onChange={(event) => setReviewName(event.target.value)}
              />
              <textarea
                className="rf-input"
                style={{ height: 80 }}
                placeholder="Враження від покупки..."
                maxLength={240}
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
              />
              <button className="rf-submit" type="button" onClick={publishReview}>
                Опублікувати відгук
              </button>
            </div>
          ) : null}

          <div className="reviews-feed">
            {reviews.map((review, index) => (
              <article key={`${review.name}-${index}`} className="adv-review-card">
                <div className="ar-header">
                  <div className="ar-avatar" style={{ background: review.color }}>
                    {review.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="ar-name">{review.name}</div>
                    <div className="ar-stars" aria-label="5 із 5">
                      ★★★★★
                    </div>
                  </div>
                  <div className="ar-verified">{review.mine ? "Ваш відгук" : "Підтверджено"}</div>
                </div>
                <p className="ar-text">{review.text}</p>
                <div className="ar-footer">
                  <span className="ar-date">{review.when}</span>
                  <div className="ar-actions">
                    <button
                      className={`reaction-btn${votes[index] === "like" ? " on" : ""}`}
                      type="button"
                      onClick={() =>
                        setVotes((prev) => ({ ...prev, [index]: prev[index] === "like" ? undefined : "like" }))
                      }
                    >
                      <ThumbsUp size={14} />
                      <span>{review.likes + (votes[index] === "like" ? 1 : 0)}</span>
                    </button>
                    <button
                      className={`reaction-btn${votes[index] === "dislike" ? " on" : ""}`}
                      type="button"
                      onClick={() =>
                        setVotes((prev) => ({
                          ...prev,
                          [index]: prev[index] === "dislike" ? undefined : "dislike",
                        }))
                      }
                    >
                      <ThumbsDown size={14} />
                      <span>{review.dislikes + (votes[index] === "dislike" ? 1 : 0)}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="order-card">
          <div className="hero-text-area">
            <h2 className="d7-title">Оформлення</h2>
            <span className="ht-sub">Оплата при отриманні · без передоплати</span>
          </div>
          <button className="shot-btn" type="button" onClick={() => setLightbox(IMAGES.poster)}>
            <img className="shot" src={IMAGES.poster} alt="Упаковка таблеток Аквакристал для пральної машини" />
          </button>
          <div className="hero-content-pad" style={{ paddingBottom: 28 }}>
            <div className="price-layout">
              <div className="p-left">
                <span className="p-main">{offer.total}₴</span>
              </div>
              <div className="p-right">
                <span className="p-label-promo">Сума замовлення</span>
                <div className="p-old-row">
                  <span className="p-old">{offer.old}₴</span>
                  <span className="p-badge">-{offer.off}%</span>
                </div>
              </div>
            </div>
            <OrderForm offer={offer} onOffer={setOffer} />
          </div>
        </section>

        <footer className="d7-legal-footer">
          <p>Доставка Новою Поштою по Україні. Оплата при отриманні.</p>
          <p>
            Послуга «Легке повернення» Нової Пошти не підтримується. Повернення можливе лише після
            погодження з менеджером.
          </p>
          <ul className="d7-legal-list">
            <li>
              <Link to="/delivery">Оплата та доставка</Link>
            </li>
            <li>
              <Link to="/privacy">Політика конфіденційності</Link>
            </li>
            <li>
              <Link to="/offer">Публічна оферта</Link>
            </li>
            <li>
              <Link to="/cookies">Файли cookie</Link>
            </li>
            <li>
              <Link to="/returns">Повернення товару</Link>
            </li>
          </ul>
        </footer>
      </div>

      <div className={`sticky-bar${sticky ? " visible" : ""}`}>
        <div>
          <div className="sb-price">299₴</div>
          <div className="sb-status">
            <span className="sb-dot" /> В наявності
          </div>
        </div>
        <button className="sb-btn" type="button" onClick={() => goOrder()}>
          <span className="blt-text">Замовити</span>
        </button>
      </div>
    </>
  );
}
