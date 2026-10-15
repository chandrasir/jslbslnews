'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE } from '../lib/site';

export default function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const close = () => setOpen(false);
  const cls = (p) => (path === p ? 'active' : '');

  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="tb-left">📍 {SITE.address} &nbsp;|&nbsp; ✉️ {SITE.email}</div>
          <div className="tb-right">
            <a href={`tel:${SITE.phone}`}>☎ {SITE.phone}</a>
            <a href={SITE.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href={SITE.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="container">
          <Link href="/" className="brand" onClick={close}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE.logo} alt="JUC logo" />
            <div className="brand-text">
              <strong>{SITE.shortNp}</strong>
              <span>NEWS &amp; NOTICE PORTAL</span>
            </div>
          </Link>

          <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? '✕' : '☰'}
          </button>

          <nav className={`nav ${open ? 'open' : ''}`}>
            <Link href="/" className={cls('/')} onClick={close}>गृहपृष्ठ</Link>
            <Link href="/news" className={cls('/news')} onClick={close}>समाचार</Link>
            <Link href="/#services" onClick={close}>सेवाहरू</Link>
            <Link href="/#contact" onClick={close}>सम्पर्क</Link>
            <Link href="/submit" className={`submit-link ${cls('/submit')}`} onClick={close}>
              ✍️ समाचार पठाउनुहोस्
            </Link>
            <a href={SITE.official} target="_blank" rel="noopener noreferrer" className="cta">
              आधिकारिक वेबसाइट ↗
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
