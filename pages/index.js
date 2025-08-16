import React, { useState, useEffect } from "react";
import Head from "next/head";

const WEBHOOK_URL = "/api/lead";

const Field = ({ label, required = false, children }) => (
  <label className="block mb-4">
    <span className="block text-sm text-slate-600 mb-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    {children}
  </label>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-wide">
    {children}
  </span>
);

const SectionTitle = ({ kicker, title, subtitle }) => (
  <div className="max-w-xl">
    {kicker && (
      <div className="mb-2 text-xs uppercase tracking-widest text-slate-500">
        {kicker}
      </div>
    )}
    <h2 className="text-2xl md:text-3xl font-semibold leading-tight mb-3">
      {title}
    </h2>
    {subtitle && (
      <p className="text-slate-600 text-sm md:text-base leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

const Stat = ({ value, label }) => (
  <div className="text-center p-4">
    <div className="text-3xl md:text-4xl font-semibold">{value}</div>
    <div className="text-xs md:text-sm text-slate-500 mt-1">{label}</div>
  </div>
);

const categories = [
  { title: "AI-Администратор соцсетей", desc: "Отвечает в Instagram/WhatsApp/Telegram, прогревает, фиксирует лиды." },
  { title: "AI-Менеджер по лидогенерации", desc: "Собирает контакты, сегментирует, назначает встречи." },
  { title: "AI-Маркетолог-копирайтер", desc: "Пишет тексты, посты, пресс-релизы." },
  { title: "AI-Дизайнер изображений", desc: "Готовит визуалы для кампаний." },
  { title: "AI-Оператор CRM (Битрикс24)", desc: "Чистит базу, ставит задачи, напоминания." },
  { title: "AI-Аналитик", desc: "Сводит отчёты, отслеживает KPI, даёт инсайты." },
  { title: "AI-Рекрутер", desc: "Фильтрует резюме, ведёт первичные интервью." },
  { title: "AI-Консьерж продаж", desc: "Персональные подборки, апселлы, кросс-селлы." },
];

const faqs = [
  { q: "Что такое биржа AI-сотрудников?", a: "Это маркетплейс готовых ролей ИИ, которые можно быстро подключить к вашему бизнес-процессу и адаптировать под ваши скрипты и правила." },
  { q: "Как происходит интеграция?", a: "Через n8n/Make и нативные коннекторы к Telegram, Instagram, WhatsApp, а также к CRM (например, Битрикс24)." },
  { q: "Какие сроки запуска?", a: "MVP роль запускаем за 1–3 дня в зависимости от каналов и сценариев." },
  { q: "Сколько стоит?", a: "Есть тарифы с оплатой за внедрение и абонплата за поддержку. Отправьте заявку — подберём оптимальный план." },
  { q: "Закон о персональных данных?", a: "Мы используем согласие пользователя и храним только необходимые данные. Есть типовые политики и соглашения для Беларуси." },
];

export default function Home() {
  const [form, setForm] = useState({
    name: "", phone: "", telegram: "", company: "",
    role: "AI-Администратор соцсетей", comment: "", consent: false,
    hp: "", // honeypot
    utm: { source: "", medium: "", campaign: "", term: "", content: "", ref: "" },
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Capture UTM + referrer once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    setForm(f => ({
      ...f,
      utm: {
        source: p.get("utm_source") || "",
        medium: p.get("utm_medium") || "",
        campaign: p.get("utm_campaign") || "",
        term: p.get("utm_term") || "",
        content: p.get("utm_content") || "",
        ref: document.referrer || ""
      }
    }));
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // Honeypot
    if (form.hp) { setError("Ошибка отправки."); return; }

    if (!form.name || !form.phone || !form.consent) {
      setError("Заполните обязательные поля и согласие.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "aiemployee.by",
          ...form,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Network error");
      setSent(true);

      // GA event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag('event', 'lead_sent', { source: 'aiemployee.by' });
      }

      setForm({
        name: "", phone: "", telegram: "", company: "",
        role: "AI-Администратор соцсетей", comment: "",
        consent: false, hp: "", utm: form.utm,
      });
    } catch (err) {
      setError("Не удалось отправить. Проверьте WEBHOOK_URL и доступность n8n.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>AIEmployee.by — биржа AI-сотрудников для бизнеса</title>
        <meta name="description" content="Готовые роли ИИ для продаж, маркетинга и поддержки. Интеграции с Telegram, Instagram, WhatsApp и Битрикс24. Запуск 1–3 дня." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://aiemployee.by" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AIEmployee.by — биржа AI-сотрудников" />
        <meta property="og:description" content="Подключайте AI-сотрудников под ваши задачи. Запуск 1–3 дня." />
        <meta property="og:image" content="/og.png" />
        <meta property="og:url" content="https://aiemployee.by" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
        {/* HEADER */}
        <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b">
          <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">AI</div>
              <div className="font-semibold tracking-tight">AIEmployee.by</div>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="#catalog" className="hover:text-slate-900 text-slate-600">Каталог ролей</a>
              <a href="#how" className="hover:text-slate-900 text-slate-600">Как это работает</a>
              <a href="#pricing" className="hover:text-slate-900 text-сlate-600">Тарифы</a>
              <a href="#lead" className="hover:text-slate-900 text-slate-600">Заявка</a>
            </nav>
            <a href="#lead" className="inline-flex items-center rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90">Начать</a>
          </div>
        </header>

        {/* HERO */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
                Биржа AI-сотрудников для бизнеса в Беларуси
              </h1>
              <p className="mt-4 text-slate-600 md:text-lg">
                Подключайте готовые роли ИИ за дни, а не недели: продажи, маркетинг,
                поддержка, CRM. Интеграции с Telegram, Instagram, WhatsApp и Битрикс24.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Badge>n8n</Badge><Badge>Bitrix24</Badge><Badge>Telegram</Badge><Badge>Instagram</Badge><Badge>WhatsApp</Badge><Badge>Google Sheets</Badge>
              </div>
              <div className="mt-8 flex gap-3">
                <a href="#lead" className="inline-flex items-center rounded-2xl bg-slate-900 text-white px-5 py-3 text-sm font-medium shadow-sm hover:opacity-90">Оставить заявку</a>
                <a href="#catalog" className="inline-flex items-center rounded-2xl border px-5 py-3 text-sm font-medium hover:bg-white">Посмотреть роли</a>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] w-full rounded-3xl border bg-white shadow-lg p-6">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border p-3"><div className="font-medium">AI-Админ</div><div className="text-slate-500 mt-1">Ответы в Direct, сбор лидов</div></div>
                  <div className="rounded-xl border p-3"><div className="font-medium">AI-Копирайтер</div><div className="text-slate-500 mt-1">Посты, баннеры, пресс-релизы</div></div>
                  <div className="rounded-xl border p-3"><div className="font-medium">AI-CRM</div><div className="text-сlate-500 mt-1">Задачи, статусы, напоминания</div></div>
                  <div className="rounded-xl border p-3 col-span-2"><div className="font-medium">Интеграции</div><div className="text-slate-500 mt-1">Telegram • Instagram • WhatsApp</div></div>
                  <div className="rounded-xl border p-3"><div className="font-medium">Запуск 1–3 дня</div><div className="text-slate-500 mt-1">Готовые шаблоны ролей</div></div>
                </div>
                <div className="absolute -inset-2 -z-10 rounded-[28px] bg-gradient-to-br from-slate-200 via-white to-slate-100" />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <Stat value="1–3 дня" label="Средний срок запуска" />
            <Stat value="> 8" label="Готовых ролей для старта" />
            <Stat value="24/7" label="Обработка обращений" />
            <Stat value="BYN" label="Оплата в бел. рублях" />
          </div>
        </section>

        {/* CATALOG */}
        <section id="catalog" className="mx-auto max-w-6xl px-4 py-16">
          <SectionTitle kicker="Каталог" title="Готовые роли AI для быстрого старта" subtitle="Выберите роль — мы адаптируем скрипты, подключим каналы и CRM, обучим на ваших данных." />
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div key={c.title} className="rounded-2xl border bg-white p-5 hover:shadow-sm">
                <div className="text-base font-medium">{c.title}</div>
                <div className="text-sm text-slate-600 mt-2">{c.desc}</div>
                <div className="mt-4 flex gap-2">
                  <a href="#lead" className="text-sm font-medium underline underline-offset-4">Подключить</a>
                  <button className="text-sm text-slate-500 hover:text-slate-700">Детали</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-16">
          <SectionTitle kicker="Процесс" title="Как это работает" subtitle="Простой путь от заявки до первых результатов." />
          <ol className="mt-8 grid md:grid-cols-5 gap-4 text-sm">
            {[
              { n: 1, t: "Заявка", d: "Оставляете контакты и нужную роль." },
              { n: 2, t: "Диагностика", d: "Собираем требования и каналы." },
              { n: 3, t: "Настройка", d: "Адаптируем скрипты, интеграции." },
              { n: 4, t: "Запуск", d: "Тест, обучение, вывод в прод." },
              { n: 5, t: "Поддержка", d: "Мониторинг, улучшения, отчёты." },
            ].map((s) => (
              <li key={s.n} className="rounded-2xl border bg-white p-5">
                <div className="text-2xl font-semibold">{s.n}</div>
                <div className="font-medium mt-1">{s.t}</div>
                <div className="text-slate-600 mt-1">{s.d}</div>
              </li>
            ))}
          </ol>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
          <SectionTitle kicker="Тарифы" title="Гибкая стоимость под задачи" subtitle="Стартовый пакет для пилота и расширенные планы для масштабирования. Цены примерные — финальную смету утвердим после диагностики." />
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              { name: "Start", price: "от 990 BYN", features: ["1 роль AI", "1 канал (Telegram/Instagram/WhatsApp)", "Базовые скрипты", "N8n-сценарий + подключение"] },
              { name: "Pro", price: "от 2 490 BYN", features: ["2–3 роли AI", "Интеграция с Битрикс24", "Обучение на ваших данных", "Дашборд и отчёты"] },
              { name: "Enterprise", price: "по запросу", features: ["5+ ролей AI", "Мультиканальность, SLA", "Модерация/ручной оверрайд", "Аудит безопасности и PD"] },
            ].map((p) => (
              <div key={p.name} className="rounded-2xl border bg-white p-6 flex flex-col">
                <div className="text-sm text-slate-500">{p.name}</div>
                <div className="text-3xl font-semibold mt-1">{p.price}</div>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><span className="mt-1 size-1.5 rounded-full bg-slate-900" /><span>{f}</span></li>
                  ))}
                </ul>
                <a href="#lead" className="mt-6 inline-flex items-center rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm font-medium self-start">Выбрать</a>
              </div>
            ))}
          </div>
        </section>

        {/* LEAD FORM */}
        <section id="lead" className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <SectionTitle kicker="Заявка" title="Давайте подключим AI-сотрудника под ваши задачи" subtitle="Оставьте контакты — пришлём предложение в течение рабочего дня." />
            <form onSubmit={submit} className="rounded-2xl border bg-white p-6 shadow-sm">
              {/* Honeypot */}
              <input name="hp" value={form.hp} onChange={onChange} className="hidden" tabIndex={-1} autoComplete="off" />

              <Field label="Имя" required>
                <input name="name" value={form.name} onChange={onChange} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="Иван" />
              </Field>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Телефон (Беларусь)" required>
                  <input name="phone" value={form.phone} onChange={onChange} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="+375 29 123-45-67" />
                </Field>
                <Field label="Telegram (@username)">
                  <input name="telegram" value={form.telegram} onChange={onChange} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="@username" />
                </Field>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Компания">
                  <input name="company" value={form.company} onChange={onChange} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="ООО АВТОИДЕЯ" />
                </Field>
                <Field label="Нужная роль">
                  <select name="role" value={form.role} onChange={onChange} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300">
                    {categories.map((c) => (<option key={c.title} value={c.title}>{c.title}</option>))}
                  </select>
                </Field>
              </div>
              <Field label="Комментарий / задачи">
                <textarea name="comment" value={form.comment} onChange={onChange} rows={4} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="Каналы, интеграции, KPI, сроки..." />
              </Field>
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" name="consent" checked={form.consent} onChange={onChange} className="mt-0.5" />
                <span>Я даю согласие на обработку персональных данных и на получение предложений по выбранным услугам. <a href="#privacy" className="underline underline-offset-4">Политика конфиденциальности</a>.</span>
              </label>
              {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}
              {sent && <div className="mt-4 text-sm text-emerald-600">Заявка отправлена. Мы свяжемся с вами.</div>}
              <button type="submit" disabled={sending} className="mt-6 inline-flex items-center rounded-2xl bg-slate-900 text-white px-5 py-3 text-sm font-medium disabled:opacity-60">{sending ? "Отправка..." : "Отправить заявку"}</button>
            </form>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <SectionTitle kicker="FAQ" title="Частые вопросы" />
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border bg-white p-5">
                <div className="font-medium">{f.q}</div>
                <div className="text-slate-600 mt-2 text-sm leading-relaxed">{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 md:justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-slate-900 text-white grid place-items-center font-bold">AI</div>
                <div className="font-medium">AIEmployee.by</div>
              </div>
              <div className="flex flex-wrap gap-3 text-slate-600">
                <a href="#" className="hover:text-slate-900">Каталог ролей</a>
                <a href="#" className="hover:text-slate-900">Интеграции</a>
                <a href="#" className="hover:text-slate-900">Партнёрам</a>
                <a href="#privacy" className="hover:text-slate-900">Политика конфиденциальности</a>
              </div>
            </div>
            <div id="privacy" className="mt-8 text-xs leading-relaxed text-slate-500">
              <div className="font-medium text-slate-700 mb-2">Политика конфиденциальности (кратко)</div>
              Мы обрабатываем персональные данные, указанные в форме, с целью подготовки коммерческого предложения и коммуникации по выбранным услугам. Правовым основанием является согласие субъекта персональных данных. Данные хранятся в защищённой CRM и/или в рамках инфраструктуры интеграций (например, n8n). Вы можете отозвать согласие, написав нам в Telegram. Полная версия политики и пользовательского соглашения будет доступна на домене aiemployee.by после публикации сайта.
            </div>
            <div className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()} AIEmployee.by — биржа AI-сотрудников. Все права защищены.</div>
          </div>
        </footer>
      </main>
    </>
  );
}
