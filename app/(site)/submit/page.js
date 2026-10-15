import SubmitForm from '../../../components/SubmitForm';

export const metadata = { title: 'समाचार पठाउनुहोस्' };

export default function SubmitPage() {
  return (
    <>
      <section className="page-banner" style={{ paddingBottom: 70 }}>
        <div className="container">
          <span className="eyebrow">Submit News</span>
          <h1 style={{ marginTop: 10 }}>तपाईंको समाचार पठाउनुहोस्</h1>
          <p>कार्यक्रम, सफलताको कथा वा समुदायका खबर हामीलाई पठाउनुहोस् — स्वीकृत भएपछि यहीँ प्रकाशित हुनेछ।</p>
        </div>
      </section>
      <section className="container submit-wrap">
        <SubmitForm />
      </section>
    </>
  );
}
