export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const meta = {
    ip: (req.headers['x-forwarded-for'] || '').split(',')[0] || null,
    ua: req.headers['user-agent'] || null,
    referer: req.headers['referer'] || null,
  };
  try {
    const r = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body, meta }),
    });
    const text = await r.text();
    res.status(r.status || 200).send(text || 'OK');
  } catch (e) {
    res.status(500).json({ ok: false, error: 'proxy_failed' });
  }
}
