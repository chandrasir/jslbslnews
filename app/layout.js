import './globals.css';
import { SITE } from '../lib/site';

export const metadata = {
  title: {
    default: `${SITE.shortNp} | समाचार तथा सूचना`,
    template: `%s | ${SITE.shortNp}`,
  },
  description: `${SITE.nameEn} — latest news, notices and programs. ${SITE.tagline}`,
  icons: { icon: SITE.logo },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#15803d',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ne">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
