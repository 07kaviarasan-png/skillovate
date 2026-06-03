import Link from "next/link";

export function LandingCta() {
  return (
    <section className="cta" id="mission">
      <div className="container">
        <div className="cta-card">
          <h2>Empowering the Future Workspace</h2>
          <p>
            Skillovate is built to function as a scalable digital infrastructure for skill intelligence. Our mission is
            to bridge the gap between academic outcomes and professional requirements.
          </p>
          <Link
            href="/learner?mode=signup"
            className="btn-login"
            style={{ background: "white", color: "var(--lp-accent)", padding: "16px 40px", fontSize: "16px" }}
          >
            Start Your Journey
          </Link>
        </div>
      </div>
    </section>
  );
}
