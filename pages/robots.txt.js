export default function Robots() { return null; }
export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/plain');
  res.write(`User-agent: *\nAllow: /\nSitemap: https://aiemployee.by/sitemap.xml\n`);
  res.end();
  return { props: {} };
}
