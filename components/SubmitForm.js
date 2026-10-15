'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { resizeImage } from '../lib/clientImage';

const CATS = ['समाचार', 'कार्यक्रम'];

export default function SubmitForm() {
  const [form, setForm] = useState({
    name: '', contact: '', title: '', category: CATS[0], content: '', showName: true, website: '',
  });
  const [imageData, setImageData] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setImageData(await resizeImage(f));
    } catch (err) {
      setError(err.message);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageData }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'पठाउन सकिएन। फेरि प्रयास गर्नुहोस्।');
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="panel submit-done">
        <div style={{ fontSize: 56 }}>✅</div>
        <h2>धन्यवाद! तपाईंको समाचार प्राप्त भयो।</h2>
        <p style={{ color: 'var(--muted)', margin: '10px 0 22px' }}>
          हाम्रो टोलीले जाँच गरेपछि स्वीकृत भएमा यो वेबसाइटमा प्रकाशित हुनेछ।
        </p>
        <div className="row-actions" style={{ justifyContent: 'center' }}>
          <Link href="/" className="btn btn-green">गृहपृष्ठ</Link>
          <button
            className="btn btn-outline"
            onClick={() => {
              setDone(false);
              setImageData('');
              setForm({ name: '', contact: '', title: '', category: CATS[0], content: '', showName: true, website: '' });
              if (fileRef.current) fileRef.current.value = '';
            }}
          >
            अर्को समाचार पठाउनुहोस्
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2>✍️ तपाईंको समाचार पठाउनुहोस्</h2>
      {error && <div className="alert err">{error}</div>}

      <div className="two-col">
        <div className="field">
          <label>तपाईंको नाम *</label>
          <input value={form.name} onChange={set('name')} required maxLength={80} placeholder="पूरा नाम" />
        </div>
        <div className="field">
          <label>सम्पर्क (फोन / इमेल)</label>
          <input value={form.contact} onChange={set('contact')} maxLength={120} placeholder="वैकल्पिक — प्रकाशित हुँदैन" />
        </div>
      </div>

      {/* honeypot: hidden from people, bots fill it */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
        <label>Website</label>
        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
      </div>

      <div className="field">
        <label>समाचारको शीर्षक *</label>
        <input value={form.title} onChange={set('title')} required maxLength={200} placeholder="शीर्षक" />
      </div>

      <div className="field">
        <label>विभाग</label>
        <select value={form.category} onChange={set('category')}>
          {CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="field">
        <label>विवरण *</label>
        <textarea value={form.content} onChange={set('content')} required maxLength={5000} placeholder="समाचारको पूरा विवरण यहाँ लेख्नुहोस्…" />
        <small>{form.content.length} / 5000</small>
      </div>

      <div className="field">
        <label>फोटो (वैकल्पिक)</label>
        <input type="file" accept="image/*" ref={fileRef} onChange={onFile} />
      </div>
      {imageData && (
        <div className="preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageData} alt="preview" />
          <button type="button" onClick={() => { setImageData(''); if (fileRef.current) fileRef.current.value = ''; }}>✕ हटाउनुहोस्</button>
        </div>
      )}

      <label className="check">
        <input type="checkbox" checked={form.showName} onChange={set('showName')} />
        <span>समाचार प्रकाशित हुँदा मेरो नाम देखाउन सहमत छु</span>
      </label>

      <button className="btn btn-orange" style={{ width: '100%' }} disabled={busy}>
        {busy ? 'पठाउँदै…' : '📨 स्वीकृतिका लागि पठाउनुहोस्'}
      </button>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>
        पठाइएका समाचार एडमिनले जाँच गरेर स्वीकृत गरेपछि मात्र प्रकाशित हुन्छन्। सम्पर्क विवरण सार्वजनिक गरिँदैन।
      </p>
    </form>
  );
}
