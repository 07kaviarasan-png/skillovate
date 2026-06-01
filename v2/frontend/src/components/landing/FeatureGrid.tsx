export function FeatureGrid() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header">
          <h2>Designed for Scale and Success</h2>
          <p>Our features are built to bridge the gap between academic learning and industry readiness.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3>AI Assessment</h3>
            <p>Intelligent aptitude evaluation with adaptive difficulty levels for precise skill mapping.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            </div>
            <h3>Real-Time Analytics</h3>
            <p>Comprehensive reporting system for institutional and organizational performance tracking.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h3>Secure Access</h3>
            <p>Enterprise-grade security with role-based access control and session management.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M3 3h18v18H3zM3 9h18M9 3v18" />
              </svg>
            </div>
            <h3>Unified Management</h3>
            <p>Centralized dashboard for managing departments, batches, and student registers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
            </div>
            <h3>Career Enablement</h3>
            <p>Integrated job alignment, opportunity tracking, and guided placement assistance.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            </div>
            <h3>Resource Center</h3>
            <p>Seamless export of insights and material management for institutional growth.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
