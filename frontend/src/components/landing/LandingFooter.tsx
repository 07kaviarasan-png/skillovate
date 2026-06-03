import Link from "next/link";

export function LandingFooter() {
  return (
    <footer>
      <div className="container">
        <div className="foo-content">
          <div className="foo-info">
            <Link href="/" className="logo" style={{ marginBottom: "16px" }}>
              <img
                src="/logo.png"
                alt="Skillovate AI Logo"
                style={{ height: "28px", width: "auto", display: "block", filter: "brightness(0) invert(1)" }}
              />
            </Link>
            <p style={{ fontSize: "13px", color: "var(--lp-muted)", maxWidth: "240px" }}>
              Advanced AI ecosystem for aptitude training and placement readiness.
            </p>
          </div>
          <div className="foo-links">
            <div className="foo-col">
              <h4>Platform</h4>
              <Link href="#features">Features</Link>
              <Link href="/learner">Login</Link>
              <Link href="/learner?mode=signup">Register</Link>
            </div>
            <div className="foo-col">
              <h4>Company</h4>
              <Link href="#about">About Us</Link>
              <Link href="#mission">Mission</Link>
              <Link href="#">Contact</Link>
            </div>
          </div>
        </div>
        <div className="foo-bottom">&copy; 2026 Skillovate AI. All rights reserved. Built for Excellence.</div>
      </div>
    </footer>
  );
}
