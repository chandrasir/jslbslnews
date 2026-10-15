import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="empty">
          <div className="big">🔎</div>
          <h2>पृष्ठ फेला परेन</h2>
          <p style={{ margin: '8px 0 18px' }}>तपाईंले खोजेको समाचार हटाइएको हुन सक्छ।</p>
          <Link href="/" className="btn btn-green">गृहपृष्ठमा जानुहोस्</Link>
        </div>
      </div>
    </section>
  );
}
