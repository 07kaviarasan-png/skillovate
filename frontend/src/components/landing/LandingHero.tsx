import Link from "next/link";

export function LandingHero() {
  return (
    <header className="hero">
      <div className="container hero-grid">
        <div className="hero-content">
          <div className="hero-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="10" height="10">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            AI-Powered Placement Prep
          </div>
          <h1 className="hero-title">
            Train <span>Smarter</span>.
            <br />
            Score <span>Higher</span>.
            <br />
            Get <span>Hired</span>.
          </h1>
          <p className="hero-subtext">
            The most advanced platform for AI-powered aptitude training, career pathing, and campus-to-corporate
            success.
          </p>
          <div className="hero-actions">
            <Link href="/learner?mode=signup" className="btn-login" style={{ padding: "14px 32px", fontSize: "16px" }}>
              Sign up free
            </Link>
            <Link
              href="/learner"
              className="nav-link"
              style={{ padding: "14px 32px", fontSize: "16px", justifyContent: "center", gap: "8px" }}
            >
              Login
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="hero-video-wrapper">
          <div className="hero-video-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg-card)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'left' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
              Master the technical interview with AI
            </h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              Practice real-world coding questions, take AI-driven mock interviews, and get immediate feedback on your performance. Build the confidence you need to land your dream job.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--accent-l)', color: 'var(--accent)', borderRadius: '50%', padding: '4px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                Industry-standard questions
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--teal-l)', color: 'var(--teal)', borderRadius: '50%', padding: '4px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                Real-time AI evaluation
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--amber-l)', color: 'var(--amber)', borderRadius: '50%', padding: '4px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                Comprehensive performance insights
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
