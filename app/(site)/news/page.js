import Link from 'next/link';
import { listNews } from '../../../lib/db';
import { CATEGORIES } from '../../../lib/site';
import { NewsCard } from '../../../components/NewsCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'समाचार तथा सूचना' };

export default async function NewsPage({ searchParams }) {
  const active = CATEGORIES.includes(searchParams?.c) ? searchParams.c : '';
  let items = [];
  try {
    items = await listNews();
  } catch (e) {
    console.error(e);
  }
  const shown = active ? items.filter((n) => n.category === active) : items;

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <span className="eyebrow">News &amp; Notice</span>
          <h1 style={{ marginTop: 10 }}>समाचार तथा सूचना</h1>
          <p>जनउत्थान सामुदायिक लघुवित्तका सबै अपडेटहरू</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="filters">
            <Link href="/news" className={`chip ${!active ? 'active' : ''}`}>सबै</Link>
            {CATEGORIES.map((c) => (
              <Link key={c} href={`/news?c=${encodeURIComponent(c)}`} className={`chip ${active === c ? 'active' : ''}`}>
                {c}
              </Link>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="empty">
              <div className="big">🗞️</div>
              <h3>यो विभागमा अहिले केही छैन</h3>
            </div>
          ) : (
            <div className="grid">
              {shown.map((n) => <NewsCard key={n.id} item={n} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
