import Link from "next/link";

export function LandingNav() {
  return (
    <nav>
      <div className="container nav-content">
        <Link href="/" className="logo">
          <img
            src="/logo.png"
            alt="Skillovate AI Logo"
            className="logo-img"
            style={{ height: "64px", width: "auto", display: "block" }}
          />
        </Link>
        <div className="nav-links">
          <Link href="#features" className="nav-link">
            Features
          </Link>
          <Link href="#about" className="nav-link">
            About
          </Link>
          <Link href="/hr" className="nav-link">
            HR/Recruitment
          </Link>
          <Link href="/institutional" className="nav-link">
            Institutional Login
          </Link>
          <Link href="/learner?mode=signup" className="btn-login">
            Sign up free
          </Link>
        </div>
      </div>
    </nav>
  );
}
