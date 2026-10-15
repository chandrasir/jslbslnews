import Link from 'next/link';
import { LINKS, SITE } from '../lib/site';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>{SITE.nameNp}</h4>
            <p>{SITE.nameEn}</p>
            <p style={{ marginTop: 8 }}>{SITE.tagline}</p>
            <p style={{ marginTop: 12 }}>
              📍 {SITE.address}
              <br />☎ {SITE.phone} &nbsp; | &nbsp; फ्याक्स: {SITE.fax}
              <br />✉️ {SITE.email}
            </p>
          </div>
          <div>
            <h4>छिटो लिंक</h4>
            <Link href="/">गृहपृष्ठ</Link>
            <Link href="/news">सबै समाचार</Link>
            <Link href="/news?c=सूचना">सूचना</Link>
            <Link href="/submit">समाचार पठाउनुहोस्</Link>
            <a href={SITE.official} target="_blank" rel="noopener noreferrer">आधिकारिक वेबसाइट</a>
            <a href={SITE.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href={SITE.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
          <div>
            <h4>सम्बन्धित लिंक</h4>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
            ))}
          </div>
        </div>
        <div className="copy">
          © {new Date().getFullYear()} {SITE.shortNp} · सर्वाधिकार सुरक्षित
        </div>
      </div>
    </footer>
  );
}
