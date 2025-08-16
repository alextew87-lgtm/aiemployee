# AIEmployee.by — сайт (Next.js + Tailwind)

## Быстрый старт (Vercel)
1. Скачайте проект и залейте его в новый репозиторий GitHub.
2. На Vercel: `Add New Project` → импортируйте репозиторий → `Deploy`.
3. В настройках проекта → **Domains** добавьте `aiemployee.by` и `www.aiemployee.by`.
4. У регистратора домена:
   - A (apex) `aiemployee.by` → `76.76.21.21` (Vercel)
   - CNAME `www` → `cname.vercel-dns.com` (Vercel подсказки см. в Settings → Domains)
5. Обновите `WEBHOOK_URL` в `pages/index.js` на ваш n8n вебхук.

## Локально
```bash
npm i
npm run dev
```

## Где менять контент
- Главная: `pages/index.js` (каталог ролей, тарифы, FAQ, тексты)
- Стили: Tailwind классы в разметке, `styles/globals.css` для общих правок.