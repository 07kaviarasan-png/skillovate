import React from "react";

export function AuthSplitLayout({
  children,
  leftContent,
}: {
  children: React.ReactNode;
  leftContent?: React.ReactNode;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", background: "var(--bg)" }}>
      <div className="lp-left">
        <div className="lp-logo">
          <img 
            src="/logo.png" 
            alt="SKILLOVATE" 
            className="lp-brand-logo" 
            style={{ mixBlendMode: "multiply", filter: "contrast(1.1) brightness(1.1)" }}
          />
        </div>
        <div className="lp-body">
          {leftContent || (
            <>
              <div className="lp-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10">
                  <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
                </svg>
                AI-Powered Aptitude Training
              </div>
              <div className="lp-title">
                Train smarter.
                <br />
                Score higher.
              </div>
              <div className="lp-sub">
                Adaptive AI that learns your weak spots, builds your profile, and connects you to real opportunities —
                all in one platform.
              </div>
              <div className="lp-stats">
                <div className="lp-stat">
                  <div className="lp-stat-val">2.4L+</div>
                  <div className="lp-stat-lbl">Students trained</div>
                </div>
                <div className="lp-stat">
                  <div className="lp-stat-val">91.4%</div>
                  <div className="lp-stat-lbl">AI accuracy</div>
                </div>
                <div className="lp-stat">
                  <div className="lp-stat-val">30+</div>
                  <div className="lp-stat-lbl">Job role paths</div>
                </div>
                <div className="lp-stat">
                  <div className="lp-stat-val">450+</div>
                  <div className="lp-stat-lbl">Colleges enrolled</div>
                </div>
              </div>
              <div className="lp-avs">
                <div className="lp-av-stack">
                  <div className="lp-av">AR</div>
                  <div className="lp-av">PK</div>
                  <div className="lp-av">VR</div>
                  <div className="lp-av">SM</div>
                </div>
                <span className="lp-av-text">Joined this week from 38 colleges</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div
        className="lp-right"
        style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}
      >
        <img
          src="/logo.png"
          alt=""
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "1200px",
            opacity: 0.12,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        {children}
      </div>
    </div>
  );
}
