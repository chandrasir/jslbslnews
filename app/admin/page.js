'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, SITE, excerpt, fmtDate } from '../../lib/site';
import { resizeImage } from '../../lib/clientImage';

const EMPTY = { title: '', category: CATEGORIES[0], content: '', imageUrl: '' };

export default function AdminPage() {
  const [state, setState] = useState('loading'); // loading | login | ready
  const [dbOk, setDbOk] = useState(true);
  const [items, setItems] = useState([]);
  const [subs, setSubs] = useState([]);
  const [tab, setTab] = useState('pending'); // pending | published
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null); // editing a published news item
  const [reviewId, setReviewId] = useState(null); // editing a submission before publishing
  const [imageData, setImageData] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [existingImage, setExistingImage] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null); // { type, text }
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const loadAll = useCallback(async () => {
    const [a, b] = await Promise.all([
      fetch('/api/news', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/submissions', { cache: 'no-store' }).then((r) => r.json()),
    ]);
    setItems(a.items || []);
    setSubs(b.items || []);
    return (b.items || []).length;
  }, []);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/auth', { cache: 'no-store' });
      const j = await r.json();
      setDbOk(j.db);
      if (j.authed) {
        const pending = await loadAll();
        setTab(pending > 0 ? 'pending' : 'published');
        setState('ready');
      } else setState('login');
    })();
  }, [loadAll]);

  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return setMsg({ type: 'err', text: j.error });
    setPassword('');
    const pending = await loadAll();
    setTab(pending > 0 ? 'pending' : 'published');
    setState('ready');
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' });
    setState('login');
  }

  function reset() {
    setForm(EMPTY);
    setEditId(null);
    setReviewId(null);
    setImageData('');
    setRemoveImage(false);
    setExistingImage('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setImageData(await resizeImage(f));
      setRemoveImage(false);
      setForm((s) => ({ ...s, imageUrl: '' }));
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    let r;
    if (reviewId) {
      // publish a submission (with the edits made in the form)
      r = await fetch(`/api/submissions/${reviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, category: form.category, content: form.content }),
      });
    } else {
      r = await fetch(editId ? `/api/news/${editId}` : '/api/news', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageData, removeImage }),
      });
    }
    const j = await r.json();
    setBusy(false);
    if (r.status === 401) return setState('login');
    if (!r.ok) return setMsg({ type: 'err', text: j.error || 'सेभ गर्न सकिएन' });

    setMsg({
      type: 'ok',
      text: reviewId
        ? '✅ स्वीकृत भयो र प्रकाशित भयो।'
        : editId
        ? '✅ समाचार अपडेट भयो।'
        : '✅ समाचार प्रकाशित भयो — अब वेबसाइटमा देखिन्छ।',
    });
    reset();
    await loadAll();
  }

  function edit(n) {
    reset();
    setTab('published');
    setEditId(n.id);
    setForm({
      title: n.title,
      category: n.category,
      content: n.content,
      imageUrl: n.image && !n.image.startsWith('/api/image/') ? n.image : '',
    });
    setExistingImage(n.image || '');
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function review(s) {
    reset();
    setReviewId(s.id);
    setForm({ title: s.title, category: s.category, content: s.content, imageUrl: '' });
    setExistingImage(s.image || '');
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function del(n) {
    if (!confirm(`"${n.title}" मेटाउने हो?`)) return;
    const r = await fetch(`/api/news/${n.id}`, { method: 'DELETE' });
    if (r.status === 401) return setState('login');
    if (editId === n.id) reset();
    setMsg({ type: 'ok', text: 'समाचार मेटाइयो।' });
    await loadAll();
  }

  async function approve(s) {
    setBusy(true);
    const r = await fetch(`/api/submissions/${s.id}`, { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.status === 401) return setState('login');
    if (!r.ok) return setMsg({ type: 'err', text: j.error || 'स्वीकृत गर्न सकिएन' });
    if (reviewId === s.id) reset();
    setMsg({ type: 'ok', text: `✅ "${s.title}" स्वीकृत भयो र प्रकाशित भयो।` });
    await loadAll();
  }

  async function reject(s) {
    if (!confirm(`"${s.title}" अस्वीकार गरेर मेटाउने हो?`)) return;
    const r = await fetch(`/api/submissions/${s.id}`, { method: 'DELETE' });
    if (r.status === 401) return setState('login');
    if (reviewId === s.id) reset();
    setMsg({ type: 'ok', text: 'पठाइएको समाचार अस्वीकार गरियो।' });
    await loadAll();
  }

  const previewSrc = reviewId
    ? existingImage
    : imageData || (!removeImage && (form.imageUrl || existingImage)) || '';

  /* ---------------- LOGIN ---------------- */
  if (state === 'loading') {
    return <div className="login"><div className="panel">Loading…</div></div>;
  }

  if (state === 'login') {
    return (
      <div className="login">
        <form className="panel" onSubmit={login}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE.logo} alt="logo" />
          <h2>एडमिन लगइन</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 18, fontSize: 14 }}>{SITE.shortNp}</p>
          {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
          <div className="field">
            <label htmlFor="pw">पासवर्ड</label>
            <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
          </div>
          <button className="btn btn-orange" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'जाँच गर्दै…' : 'लगइन'}
          </button>
          <p style={{ marginTop: 16 }}><Link href="/" style={{ color: 'var(--green-700)', fontWeight: 600 }}>← वेबसाइटमा फर्किनुहोस्</Link></p>
        </form>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */
  const formTitle = reviewId
    ? '🔎 पठाइएको समाचार जाँच / सम्पादन'
    : editId
    ? '✏️ समाचार सम्पादन'
    : '➕ नयाँ समाचार थप्नुहोस्';

  return (
    <div className="admin-wrap">
      <div className="admin-bar">
        <div className="container">
          <h1>📰 समाचार व्यवस्थापन — {SITE.shortNp}</h1>
          <div className="right">
            <button onClick={loadAll} className="btn btn-ghost btn-sm">🔄 रिफ्रेस</button>
            <Link href="/" target="_blank" className="btn btn-ghost btn-sm">वेबसाइट हेर्नुहोस् ↗</Link>
            <button onClick={logout} className="btn btn-orange btn-sm">लगआउट</button>
          </div>
        </div>
      </div>

      <div className="container">
        {!dbOk && (
          <div className="alert warn" style={{ marginTop: 20 }}>
            ⚠️ डाटाबेस जोडिएको छैन — समाचार अस्थायी रूपमा मात्र सेभ हुन्छ। Vercel → Storage बाट <b>Upstash Redis</b> जोड्नुहोस्।
          </div>
        )}

        <div className="admin-main">
          {/* FORM */}
          <form className="panel" onSubmit={save}>
            <h2>{formTitle}</h2>
            {reviewId && (
              <div className="alert warn">
                यो आगन्तुकले पठाएको समाचार हो। आवश्यक भए सम्पादन गरेर “स्वीकृत गरी प्रकाशित गर्नुहोस्” थिच्नुहोस्।
              </div>
            )}
            {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

            <div className="field">
              <label>शीर्षक *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="समाचारको शीर्षक" required maxLength={200} />
            </div>

            <div className="field">
              <label>विभाग</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="field">
              <label>विवरण *</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="समाचारको पूरा विवरण यहाँ लेख्नुहोस्। नयाँ अनुच्छेदका लागि Enter थिच्नुहोस्।" required />
            </div>

            {!reviewId && (
              <div className="field">
                <label>फोटो (वैकल्पिक)</label>
                <input type="file" accept="image/*" ref={fileRef} onChange={onFile} />
                <small>वा फोटोको इन्टरनेट लिंक (URL) हाल्नुहोस्:</small>
                <input value={form.imageUrl} onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); setImageData(''); setRemoveImage(false); }} placeholder="https://..." />
              </div>
            )}

            {previewSrc && (
              <div className="preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewSrc} alt="preview" />
                {!reviewId && (
                  <button type="button" onClick={() => { setImageData(''); setRemoveImage(true); setForm({ ...form, imageUrl: '' }); if (fileRef.current) fileRef.current.value = ''; }}>
                    ✕ हटाउनुहोस्
                  </button>
                )}
              </div>
            )}

            <div className="row-actions">
              <button className="btn btn-green" disabled={busy}>
                {busy
                  ? 'सेभ हुँदै…'
                  : reviewId
                  ? '✅ स्वीकृत गरी प्रकाशित गर्नुहोस्'
                  : editId
                  ? 'अपडेट गर्नुहोस्'
                  : '🚀 प्रकाशित गर्नुहोस्'}
              </button>
              {(editId || reviewId) && <button type="button" className="btn btn-outline" onClick={reset}>रद्द</button>}
            </div>
          </form>

          {/* LISTS */}
          <div className="panel">
            <div className="tabs">
              <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
                📥 स्वीकृति प्रतीक्षामा {subs.length > 0 && <span className="count">{subs.length}</span>}
              </button>
              <button className={`tab ${tab === 'published' ? 'active' : ''}`} onClick={() => setTab('published')}>
                📋 प्रकाशित ({items.length})
              </button>
            </div>

            {tab === 'pending' ? (
              subs.length === 0 ? (
                <div className="empty" style={{ padding: 30 }}>
                  पठाइएको कुनै समाचार प्रतीक्षामा छैन।
                  <br /><small>आगन्तुकले <b>/submit</b> पृष्ठबाट समाचार पठाउन सक्छन्।</small>
                </div>
              ) : (
                <div className="list">
                  {subs.map((s) => (
                    <div className="item pending" key={s.id}>
                      {s.image ? (
                        <div className="thumb">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={s.image} alt="" /></div>
                      ) : (
                        <div className="thumb ph">📰</div>
                      )}
                      <div>
                        <h3>{s.title}</h3>
                        <div className="meta"><span className="tag">{s.category}</span><span>{fmtDate(s.createdAt)}</span></div>
                        <p className="sub-by">
                          👤 {s.name}{s.contact ? ` · ${s.contact}` : ''}{s.showName ? '' : ' · (नाम नदेखाउने)'}
                        </p>
                        <p className="sub-ex">{excerpt(s.content, 150)}</p>
                      </div>
                      <div className="btns">
                        <button className="btn btn-green btn-sm" disabled={busy} onClick={() => approve(s)}>✅ स्वीकृत</button>
                        <button className="btn btn-outline btn-sm" onClick={() => review(s)}>✏️ जाँच / सम्पादन</button>
                        <button className="btn btn-danger btn-sm" onClick={() => reject(s)}>✕ अस्वीकार</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : items.length === 0 ? (
              <div className="empty" style={{ padding: 30 }}>अहिलेसम्म केही छैन। बायाँतिरको फारम भर्नुहोस्।</div>
            ) : (
              <div className="list">
                {items.map((n) => (
                  <div className="item" key={n.id}>
                    {n.image ? (
                      <div className="thumb">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={n.image} alt="" /></div>
                    ) : (
                      <div className="thumb ph">📰</div>
                    )}
                    <div>
                      <h3>{n.title}</h3>
                      <div className="meta"><span className="tag">{n.category}</span><span>{fmtDate(n.createdAt)}</span></div>
                    </div>
                    <div className="btns">
                      <Link href={`/news/${n.id}`} target="_blank" className="btn btn-outline btn-sm">हेर्नुहोस्</Link>
                      <button className="btn btn-outline btn-sm" onClick={() => edit(n)}>सम्पादन</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(n)}>मेटाउनुहोस्</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
