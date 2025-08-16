import React, { useState } from "react";
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
  {
    title: "AI‑Администратор соцсетей",
    desc: "Отвечает в Instagram/WhatsApp/Telegram, прогревает, фиксирует лиды.",
  },
  {
    title: "AI‑Менеджер по лидогенерации",
    desc: "Собирает контакты, сегментирует, назначает встречи.",
  },
  { title: "AI‑Маркетолог‑копирайтер", desc: "Пишет тексты, посты, пресс‑релизы." },
  { title: "AI‑Дизайнер изображений", desc: "Готовит визуалы для кампаний." },
  { title: "AI‑Оператор CRM (Битрикс24)", desc: "Чистит базу, ставит задачи, напоминания." },
  { title: "AI‑Аналитик", desc: "Сводит отчёты, отслеживает KPI, даёт инсайты." },
  { title: "AI‑Рекрутер", desc: "Фильтрует резюме, ведёт первичные интервью." },
  { title: "AI‑Консьерж продаж", desc: "Персональные подборки, апселлы, кросс‑селлы." },
];

const faqs = [
  {
    q: "Что такое биржа AI‑сотрудников?",
    a: "Это маркетплейс готовых ролей ИИ, которые можно быстро подключить к вашему бизнес‑процессу и адаптировать под ваши скрипты и правила.",
  },
  {
    q: "Как происходит интеграция?",
    a: "Через n8n/Make и нативные коннекторы к Telegram, Instagram, WhatsApp, а также к CRM (например, Битрикс24).",
  },
  {
    q: "Какие сроки запуска?",
    a: "MVP роль запускаем за 1–3 дня в зависимости от каналов и сценариев.",
  },
  {
    q: "Сколько стоит?",
    a: "Есть тарифы с оплатой за внедрение и абонплата за поддержку. Отправьте заявку — подберём оптимальный план.",
  },
  {
    q: "Закон о персональных данных?",
    a: "Мы используем согласие пользователя и храним только необходимые данные. Есть типовые политики и соглашения для Беларуси.",
  },
];

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    telegram: "",
    company: "",
    role: "AI‑Администратор соцсетей",
    comment: "",
    consent: false,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
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
      setForm({
        name: "",
        phone: "",
        telegram: "",
        company: "",
        role: "AI‑Администратор соцсетей",
        comment: "",
        consent: false,
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
        <title>AIEmployee.by — биржа AI‑сотрудников для бизнеса</title>
        <meta name="description" content="Готовые роли ИИ для продаж, маркетинга и поддержки. Интеграции с Telegram, Instagram, WhatsApp и Битрикс24. Запуск 1–3 дня." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://aiemployee.by" />
        {/* Open Graph / Twitter */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AIEmployee.by — биржа AI‑сотрудников" />
        <meta property="og:description" content="Подключайте AI‑сотрудников под ваши задачи. Запуск 1–3 дня." />
        <meta property="og:image" content="/og.png" />
        <meta property="og:url" content="https://aiemployee.by" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
        {/* ...rest of the page stays the same as your current file ... */}
      </main>
    </>
  );
}
