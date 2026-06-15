"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

export function ResumeBuilder() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    objective: "",
    education: "",
    skills: "",
    experience: ""
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post("/ai/resume/improve", {
        objective: formData.objective,
        education: formData.education,
        skills: formData.skills,
        experience: formData.experience
      });
      setFormData(prev => ({
        ...prev,
        objective: res.data.objective || prev.objective,
        education: res.data.education || prev.education,
        skills: res.data.skills || prev.skills,
        experience: res.data.experience || prev.experience
      }));
      alert("Resume improved using AI!");
    } catch (err) {
      console.error(err);
      alert("Failed to improve resume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="screen active" style={{ padding: "40px" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #resume-preview, #resume-preview * { visibility: visible; }
          #resume-preview { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>Resume Builder</h2>
          <p style={{ color: "var(--muted)", fontSize: "15px" }}>Create and download your professional resume.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {!showPreview && (
            <button 
              onClick={handleGenerateAI} 
              disabled={isGenerating || (!formData.objective && !formData.experience && !formData.skills && !formData.education)}
              className="btn"
              style={{ padding: "10px 20px", background: "var(--purple)", color: "white", opacity: isGenerating ? 0.7 : 1 }}
            >
              {isGenerating ? "Generating..." : "✨ Improve with AI (Groq)"}
            </button>
          )}
          <button 
            onClick={() => setShowPreview(!showPreview)} 
            className="btn btn-p"
            style={{ padding: "10px 20px" }}
          >
            {showPreview ? "Edit Details" : "Preview Resume"}
          </button>
        </div>
      </div>

      {!showPreview ? (
        <div className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "30px" }}>
          <div style={{ display: "grid", gap: "20px" }}>
            <div>
              <label className="lbl">Full Name</label>
              <input type="text" className="fi" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label className="lbl">Email Address</label>
                <input type="email" className="fi" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label className="lbl">Phone Number</label>
                <input type="text" className="fi" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="lbl">Professional Objective</label>
              <textarea className="fi" name="objective" value={formData.objective} onChange={handleChange} style={{ height: "100px", resize: "vertical" }} placeholder="A brief statement about your career goals..."></textarea>
            </div>
            <div>
              <label className="lbl">Education</label>
              <textarea className="fi" name="education" value={formData.education} onChange={handleChange} style={{ height: "100px", resize: "vertical" }} placeholder="Degree, College Name, Graduation Year..."></textarea>
            </div>
            <div>
              <label className="lbl">Technical Skills</label>
              <textarea className="fi" name="skills" value={formData.skills} onChange={handleChange} style={{ height: "100px", resize: "vertical" }} placeholder="React, Node.js, Python, SQL..."></textarea>
            </div>
            <div>
              <label className="lbl">Experience & Projects</label>
              <textarea className="fi" name="experience" value={formData.experience} onChange={handleChange} style={{ height: "120px", resize: "vertical" }} placeholder="Describe your relevant experience or academic projects..."></textarea>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px" }} id="resume-preview">
          <div style={{ borderBottom: "2px solid var(--accent)", paddingBottom: "20px", marginBottom: "20px" }}>
            <h1 style={{ fontSize: "36px", fontWeight: 800, color: "var(--text)", marginBottom: "10px" }}>{formData.name || "Your Name"}</h1>
            <p style={{ color: "var(--muted)", fontSize: "16px" }}>
              {formData.email} {formData.phone ? `| ${formData.phone}` : ""}
            </p>
          </div>
          
          {formData.objective && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent)", marginBottom: "8px", textTransform: "uppercase" }}>Objective</h3>
              <p style={{ color: "var(--text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{formData.objective}</p>
            </div>
          )}

          {formData.education && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent)", marginBottom: "8px", textTransform: "uppercase" }}>Education</h3>
              <p style={{ color: "var(--text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{formData.education}</p>
            </div>
          )}

          {formData.skills && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent)", marginBottom: "8px", textTransform: "uppercase" }}>Skills</h3>
              <p style={{ color: "var(--text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{formData.skills}</p>
            </div>
          )}

          {formData.experience && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent)", marginBottom: "8px", textTransform: "uppercase" }}>Experience & Projects</h3>
              <p style={{ color: "var(--text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{formData.experience}</p>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "40px" }} className="no-print">
            <button className="btn btn-g" onClick={handlePrint} style={{ padding: "12px 32px", fontSize: "16px" }}>
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
