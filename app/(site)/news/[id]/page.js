import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNews, listNews } from '../../../../lib/db';
import { excerpt, fmtDate } from '../../../../lib/site';
import { NewsCard, Thumb, tagClass } from '../../../../components/NewsCard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const item = await getNews(params.id).catch(() => null);
  if (!item) return { title: 'समाचार फेला परेन' };
  return { title: item.title, description: excerpt(item.content, 160) };
}

export default async function Article({ params }) {
  const item = await getNews(params.id).catch(() => null);
  if (!item) notFound();

  const related = (await listNews().catch(() => []))
    .filter((n) => n.id !== item.id)
    .slice(0, 3);
  const paragraphs = item.content.split(/\n+/).filter(Boolean);

  return (
    <>
      <section className="page-banner" style={{ paddingBottom: 80 }}>
        <div className="container">
          <Link href="/news" style={{ color: '#fdba74', fontWeight: 600 }}>← सबै समाचार</Link>
        </div>
      </section>

      <article className="article">
        {item.image && <Thumb item={item} className="cover" />}
        <div className="inner">
          <div className="meta">
            <span className={tagClass(item.category)}>{item.category}</span>
            <span>📅 {fmtDate(item.createdAt)}</span>
            {item.byline && <span>✍️ प्रस्तुत: {item.byline}</span>}
          </div>
          <h1>{item.title}</h1>
          <div className="text">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">More</span>
                <h2>अन्य समाचार</h2>
              </div>
            </div>
            <div className="grid">
              {related.map((n) => <NewsCard key={n.id} item={n} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
