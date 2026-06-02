"use client";

import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { HrLogin } from "@/components/hr/HrLogin";
import { HrShell } from "@/components/layout/HrShell";
import { useEffect, useState } from "react";

export default function HrPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { activeScreen, setActiveScreen } = useUiStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If arriving at HR page, make sure screen defaults to hr-dash
    if (activeScreen === "dash") {
      setActiveScreen("hr-dash");
    }
  }, [activeScreen, setActiveScreen]);

  if (!mounted) return null;

  // IMPORTANT: Force HR login if not logged in OR if logged in as a student/other role
  if (!isAuthenticated || (user?.role !== "hr" && user?.role !== "recruiter")) {
    // If they are logged in but not HR, we could optionally show a message or just show the login
    return <HrLogin />;
  }

  const currentScreen = activeScreen === "dash" ? "hr-dash" : activeScreen;

  return (
    <HrShell>
      {currentScreen === "hr-dash" && (
        <div className="screen active" id="screen-hr-dash">
          <div className="hero">
            <div className="hero-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              HR Dashboard · {(user as any)?.company || "Zoho Corporation"}
            </div>
            <div className="hero-title">
              Find Your Next<br />
              Top Talent.
            </div>
            <div className="hero-sub">
              Browse AI-scored aptitude profiles, view job-role badges, and shortlist directly from the SkilloWait leaderboard.
            </div>
            <div className="hero-acts">
              <button className="hbtn hbtn-w" onClick={() => setActiveScreen("hr-vac")}>Post a Vacancy</button>
              <button className="hbtn hbtn-gh" onClick={() => setActiveScreen("hr-lb")}>View Talent Board</button>
            </div>
          </div>
          <div className="sg">
            <div className="sc">
              <div className="si2" style={{ background: "var(--accent-l)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" width="15" height="15">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                </svg>
              </div>
              <div className="sv">0</div>
              <div className="sl">Active Vacancies</div>
              <div className="sd neu">—</div>
            </div>
            <div className="sc">
              <div className="si2" style={{ background: "var(--green-l)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" width="15" height="15">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div className="sv">0</div>
              <div className="sl">Total Applicants</div>
              <div className="sd neu">—</div>
            </div>
            <div className="sc">
              <div className="si2" style={{ background: "var(--purple-l)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" width="15" height="15">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              </div>
              <div className="sv">0</div>
              <div className="sl">Shortlisted</div>
              <div className="sd neu">—</div>
            </div>
            <div className="sc">
              <div className="si2" style={{ background: "var(--amber-l)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" width="15" height="15">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
              </div>
              <div className="sv">—</div>
              <div className="sl">Top Score (Avg)</div>
              <div className="sd neu">No data yet</div>
            </div>
          </div>
          
          <div className="gms">
            <div className="card">
              <div className="ct">Recent Applicants <span onClick={() => setActiveScreen("hr-app")} style={{ cursor: "pointer" }}>View all</span></div>
              <div style={{ textAlign: "center", padding: "36px", color: "var(--muted)", fontSize: "13px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" style={{ display: "block", margin: "0 auto 10px", opacity: 0.3 }}>
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                No applicants yet. Post a vacancy to get started.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="card">
                <div className="ct">Your Vacancies</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
                  <div className="vcard">
                    <div className="vtit">Full Stack Developer</div>
                    <div className="vco">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      Zoho Corporation · Internship
                    </div>
                    <span className="badge bg">Active · 31 applied</span>
                  </div>
                  <div className="vcard">
                    <div className="vtit">Backend Engineer</div>
                    <div className="vco">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      Zoho Corporation · Full-time
                    </div>
                    <span className="badge bg">Active · 16 applied</span>
                  </div>
                </div>
                <button className="btn btn-p btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => setActiveScreen("hr-vac")}>
                  + Post New Vacancy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {currentScreen === "hr-vac" && (
        <div className="screen active" id="screen-hr-vac">
          <div className="ph">
            <div className="pt">Post a Vacancy</div>
            <div className="ps">Once posted, eligible students can apply directly from their Profile Summarizer</div>
          </div>
          <div className="g2">
            <div className="card">
              <div className="ct">Vacancy Details</div>
              <label className="input-lbl">Job Title</label>
              <input className="input-field" placeholder="e.g. Full Stack Developer" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px" }}>
                <div>
                  <label className="input-lbl">Role Type</label>
                  <select className="input-field" style={{ marginBottom: 0 }}>
                    <option>Full-time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                  </select>
                </div>
                <div>
                  <label className="input-lbl">Deadline</label>
                  <input className="input-field" type="date" style={{ marginBottom: 0 }} />
                </div>
              </div>
              <div style={{ height: "12px" }}></div>
              <label className="input-lbl">Required Subjects / Skills</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px", border: "1.5px solid var(--border)", borderRadius: "var(--r2)", background: "var(--surface)", marginBottom: "12px" }}>
                <span className="badge bb">
                  Quantitative
                  <button style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "4px", color: "var(--accent)" }}>×</button>
                </span>
                <span className="badge bb">
                  Logical Reasoning
                  <button style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "4px", color: "var(--accent)" }}>×</button>
                </span>
                <button className="btn btn-g btn-sm">+ Add</button>
              </div>
              <label className="input-lbl">
                Minimum Aptitude Score <span style={{ color: "var(--faint)", fontWeight: 400 }}>(optional)</span>
              </label>
              <input className="input-field" type="number" placeholder="e.g. 70" />
              <label className="input-lbl">Graduation Year</label>
              <select className="input-field">
                <option>Any year</option>
                <option>2025</option>
                <option>2026</option>
                <option>2027</option>
              </select>
              <label className="input-lbl">Job Description</label>
              <textarea className="input-field" rows={4} placeholder="Paste JD here — students see this before applying" style={{ resize: "none" }}></textarea>
              <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }}>
                Post Vacancy Live
              </button>
            </div>
            <div className="card" style={{ background: "var(--surface2)" }}>
              <div className="ct">Live Preview</div>
              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: "18px", marginBottom: "14px" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
                  Full Stack Developer
                </div>
                <div style={{ fontSize: "12px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "5px", marginBottom: "12px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  {(user as any)?.company || "Zoho Corporation"} · Internship
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <span className="badge bb">Quantitative</span>
                  <span className="badge bb">Logical Reasoning</span>
                  <span className="badge ba">Min Score: 70</span>
                </div>
                <button className="btn btn-p btn-sm" style={{ width: "100%", justifyContent: "center" }}>Apply Now</button>
              </div>
              <div style={{ background: "var(--green-l)", border: "1.5px solid rgba(14,159,110,.18)", borderRadius: "var(--r2)", padding: "12px", fontSize: "12px", color: "var(--text)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--green)" }}>Who sees this?</strong> All SkilloWait students matching your filters will see this vacancy in their Profile Summarizer → Open Roles tab.
              </div>
            </div>
          </div>
        </div>
      )}
      
      {currentScreen !== "hr-dash" && currentScreen !== "hr-vac" && (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
          <h2>{currentScreen.replace("hr-", "").toUpperCase()} Screen</h2>
          <p>This module is currently being migrated to React.</p>
        </div>
      )}
    </HrShell>
  );
}
