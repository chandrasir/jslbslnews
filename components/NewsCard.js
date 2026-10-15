import Link from 'next/link';
import { excerpt, fmtDate } from '../lib/site';

export function tagClass(category) {
  if (category === 'सूचना') return 'tag notice';
  if (category === 'कार्यक्रम') return 'tag event';
  return 'tag';
}

export function Thumb({ item, className = '' }) {
  if (item.image) {
    return (
      <div className={`thumb ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.title} loading="lazy" />
      </div>
    );
  }
  return <div className={`thumb ph ${className}`}>📰</div>;
}

export function NewsCard({ item }) {
  return (
    <Link href={`/news/${item.id}`} className="card">
      <Thumb item={item} />
      <div className="body">
        <div className="meta">
          <span className={tagClass(item.category)}>{item.category}</span>
          <span>{fmtDate(item.createdAt)}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{excerpt(item.content, 110)}</p>
        <span className="more">थप पढ्नुहोस् →</span>
      </div>
    </Link>
  );
}

export function FeaturedCard({ item }) {
  return (
    <Link href={`/news/${item.id}`} className="featured">
      <Thumb item={item} />
      <div className="body">
        <div className="meta">
          <span className={tagClass(item.category)}>{item.category}</span>
          <span>{fmtDate(item.createdAt)}</span>
          <span className="tag notice">ताजा</span>
        </div>
        <h3>{item.title}</h3>
        <p>{excerpt(item.content, 220)}</p>
        <span className="more">पूरा पढ्नुहोस् →</span>
      </div>
    </Link>
  );
}
