import "../styles/globals.css";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export default function App({ Component, pageProps }) {
  return (
    <>
      {GA_ID && (
        <>
          <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
      <Component {...pageProps} />
    </>
  );
}
