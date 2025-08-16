export default function SiteMap() {}
export async function getServerSideProps({ res }) {
  const pages = ['', '#catalog', '#how', '#pricing', '#lead'];
  const urls = pages.map(p => `<url><loc>https://aiemployee.by/${p}</loc></url>`).join('');
  res.setHeader('Content-Type', 'application/xml');
  res.write(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  res.end();
  return { props: {} };
}
