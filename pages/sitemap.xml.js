export default function SiteMap() { return null; }
export async function getServerSideProps({ res }) {
  const urls = ["https://aiemployee.by/"].map(u => `<url><loc>${u}</loc></url>`).join("");
  res.setHeader('Content-Type', 'application/xml');
  res.write(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  res.end();
  return { props: {} };
}
