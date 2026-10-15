import Link from 'next/link';
import { listNews } from '../../lib/db';
import { SERVICES, SITE } from '../../lib/site';
import { FeaturedCard, NewsCard } from '../../components/NewsCard';

export const dynamic = 'force-dynamic'; // always show the newest posts

export default async function Home() {
  let items = [];
  try {
    items = await listNews();
  } catch (e) {
    console.error('Could not load news', e);
  }
  const [first, ...rest] = items;
  const more = rest.slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="badge">🌿 नेपाल राष्ट्र बैंक इजाजतप्राप्त 'घ' वर्ग</span>
            <h1>
              ग्रामीण समुदायको <em>आर्थिक उन्नति</em> तर्फ — हाम्रा ताजा समाचार
            </h1>
            <p className="lead">
              {SITE.nameNp} का समाचार, सूचना तथा कार्यक्रमहरू एकै ठाउँमा। १९ जिल्लामा फैलिएको हाम्रो सेवा सञ्जाल।
            </p>
            <div className="hero-actions">
              <Link href="/news" className="btn btn-orange">ताजा समाचार हेर्नुहोस्</Link>
              <a href={SITE.official} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                आधिकारिक वेबसाइट ↗
              </a>
            </div>
          </div>
          <div className="hero-cards">
            <div className="stat"><b>१९</b><span>जिल्ला कार्यक्षेत्र</span></div>
            <div className="stat"><b>'घ'</b><span>वर्गको इजाजतपत्र</span></div>
            <div className="stat"><b>४</b><span>मुख्य सेवा योजना</span></div>
            <div className="stat"><b>NRB</b><span>द्वारा नियमन</span></div>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="section" id="news">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Latest Updates</span>
              <h2>ताजा समाचार तथा सूचना</h2>
            </div>
            <div className="row-actions">
              <Link href="/submit" className="btn btn-orange btn-sm">✍️ समाचार पठाउनुहोस्</Link>
              <Link href="/news" className="btn btn-outline btn-sm">सबै हेर्नुहोस् →</Link>
            </div>
          </div>

          {!first ? (
            <div className="empty">
              <div className="big">📰</div>
              <h3>अहिलेसम्म कुनै समाचार प्रकाशित भएको छैन</h3>
              <p>/admin बाट लगइन गरेर पहिलो समाचार थप्नुहोस्।</p>
            </div>
          ) : (
            <>
              <FeaturedCard item={first} />
              {more.length > 0 && (
                <div className="grid">
                  {more.map((n) => <NewsCard key={n.id} item={n} />)}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* SERVICES */}
      <section className="section services" id="services">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Our Services</span>
              <h2>हाम्रा सेवाहरू</h2>
            </div>
            <p>समुदायको आवश्यकता अनुसार बचत, ऋण, रेमिट्यान्स र बीमा सेवा।</p>
          </div>
          <div className="svc-grid">
            {SERVICES.map((s) => (
              <a key={s.en} href={s.href} target="_blank" rel="noopener noreferrer" className="svc">
                <div className="ic">{s.icon}</div>
                <h3>{s.title}</h3>
                <small>{s.en}</small>
                <p>{s.text}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="section" id="contact">
        <div className="container">
          <div className="contact-box">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span className="eyebrow">Contact</span>
              <h2 style={{ margin: '12px 0' }}>हामीसँग सम्पर्कमा रहनुहोस्</h2>
              <p style={{ color: '#d9f2e2', marginBottom: 20 }}>
                कुनै जिज्ञासा वा गुनासो भए हाम्रो प्रधान कार्यालयमा सम्पर्क गर्न सक्नुहुनेछ।
              </p>
              <a href={SITE.official + '/pages/contact'} target="_blank" rel="noopener noreferrer" className="btn btn-orange">
                सम्पर्क पृष्ठ ↗
              </a>
            </div>
            <div className="contact-list">
              <div>📍 {SITE.address}</div>
              <div>☎ <a href={`tel:${SITE.phone}`}>{SITE.phone}</a> &nbsp;|&nbsp; फ्याक्स: {SITE.fax}</div>
              <div>✉️ <a href={`mailto:${SITE.email}`}>{SITE.email}</a></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
