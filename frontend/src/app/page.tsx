import "./landing.css";
import Link from "next/link";


export default function Home() {
  return (
    <div className="landing-root">
      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-container lp-nav-content">
          <Link href="/" className="lp-logo">
            <img src="/logo.png" alt="Skillovate" style={{ height: 64, width: "auto" }} />
          </Link>
          <div className="lp-nav-links">
            <a href="#features" className="lp-navlink">Features</a>
            <a href="#about" className="lp-navlink">About</a>
            <Link href="/hr" className="lp-navlink">HR/Recruitment</Link>
            <Link href="/institutional" className="lp-navlink">Institutional Login</Link>
            <Link href="/learner?mode=signup" className="lp-btn-primary">Sign up free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-content">
            <div className="lp-hero-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="10" height="10">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              AI-Powered Placement Prep
            </div>
            <h1 className="lp-hero-title">
              Train <span>Smarter</span>.<br />
              Score <span>Higher</span>.<br />
              Get <span>Hired</span>.
            </h1>
            <p className="lp-hero-sub">
              The most advanced platform for AI-powered aptitude training, career pathing, and campus-to-corporate success.
            </p>
            <div className="lp-hero-actions">
              <Link href="/learner?mode=signup" className="lp-btn-primary lp-btn-lg">Sign up free</Link>
              <Link href="/learner" className="lp-btn-ghost lp-btn-lg">
                Login
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="lp-hero-media">
            <div className="lp-video-box">
              <video autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                <source src="/hero_video.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </header>

      {/* ── FEATURES ── */}
      <section className="lp-features" id="features">
        <div className="lp-container">
          <div className="lp-section-header">
            <h2>Designed for Scale and Success</h2>
            <p>Our features are built to bridge the gap between academic learning and industry readiness.</p>
          </div>
          <div className="lp-features-grid">
            {[
              { icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", title: "AI Assessment", desc: "Intelligent aptitude evaluation with adaptive difficulty levels for precise skill mapping." },
              { icon: "M18 20V10M12 20V4M6 20v-6", title: "Real-Time Analytics", desc: "Comprehensive reporting system for institutional and organizational performance tracking." },
              { icon: "M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-3h4l2 3h4a2 2 0 012 2v12a2 2 0 01-2 2z", title: "Secure Access", desc: "Enterprise-grade security with role-based access control and session management." },
              { icon: "M3 3h18v18H3zM3 9h18M9 3v18", title: "Unified Management", desc: "Centralized dashboard for managing departments, batches, and student registers." },
              { icon: "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z", title: "Career Enablement", desc: "Integrated job alignment, opportunity tracking, and guided placement assistance." },
              { icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8", title: "Resource Centre", desc: "Seamless export of insights and material management for institutional growth." },
            ].map((f) => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="lp-about" id="about">
        <div className="lp-container lp-about-grid">
          <div className="lp-about-text">
            <h2 className="lp-about-title">Built for Every Stakeholder in the Placement Ecosystem</h2>
            <p>Skillovate unifies students, faculty, institutions, and recruiters into one intelligent network — where every interaction improves outcomes.</p>
            <p><strong>Students</strong> get AI-driven practice, performance analytics, and direct exposure to hiring pipelines. <strong>Institutions</strong> gain full visibility into batch performance and placement readiness.</p>
            <p><strong>Recruiters</strong> access a pre-scored, verified talent pool — cutting hiring time from weeks to hours.</p>
          </div>
          <div className="lp-about-cards">
            {[
              { emoji: "🎓", title: "Students", desc: "Adaptive mock tests, scores & career paths", bg: "#EFF6FF", color: "#1B6FE6" },
              { emoji: "🏫", title: "Institutions", desc: "Batch-level analytics & faculty control", bg: "#F0FDF4", color: "#16A34A" },
              { emoji: "🏢", title: "Recruiters", desc: "Pre-vetted candidates with transparent scores", bg: "#FFF7ED", color: "#EA580C" },
              { emoji: "👨‍🏫", title: "Faculty", desc: "Upload batches, track & guide students", bg: "#FAF5FF", color: "#9333EA" },
            ].map((c) => (
              <div key={c.title} className="lp-a-card">
                <div className="lp-a-icon" style={{ background: c.bg, color: c.color }}>{c.emoji}</div>
                <div>
                  <h4>{c.title}</h4>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta" id="mission">
        <div className="lp-container">
          <div className="lp-cta-card">
            <h2>Empowering the Future Workspace</h2>
            <p>Skillovate is built to function as a scalable digital infrastructure for skill intelligence. Our mission is to bridge the gap between academic outcomes and professional requirements.</p>
            <Link href="/learner?mode=signup" className="lp-btn-white lp-btn-lg">Start Your Journey</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-content">
            <div>
              <img src="/logo.png" alt="Skillovate" style={{ height: 48, width: "auto", marginBottom: 12, mixBlendMode: "multiply", filter: "contrast(1.1) brightness(1.05)" }} />
              <p style={{ fontSize: 13, color: "#6B7280", maxWidth: 220 }}>Advanced AI ecosystem for aptitude training and placement readiness.</p>
            </div>
            <div className="lp-footer-links">
              <div className="lp-foo-col">
                <h4>Platform</h4>
                <a href="#features">Features</a>
                <Link href="/learner">Login</Link>
                <Link href="/learner?mode=signup">Register</Link>
              </div>
              <div className="lp-foo-col">
                <h4>Company</h4>
                <a href="#about">About Us</a>
                <a href="#mission">Mission</a>
              </div>
              <div className="lp-foo-col">
                <h4>Portals</h4>
                <Link href="/hr">HR / Recruiter</Link>
                <Link href="/institutional">Institution</Link>
                <Link href="/faculty">Faculty</Link>
              </div>
            </div>
          </div>
          <div className="lp-foo-bottom">© 2026 Skillovate AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
