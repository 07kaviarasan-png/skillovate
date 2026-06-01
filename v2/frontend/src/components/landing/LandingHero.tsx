import Link from "next/link";

export function LandingHero() {
  return (
    <header className="hero">
      <div className="container hero-grid">
        <div className="hero-content">
          <div className="hero-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="10" height="10">
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="hero-video-wrapper">
          <div className="hero-video-container">
            <video className="hero-video" autoPlay muted loop playsInline>
              <source src="/hero_video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </header>
  );
}
