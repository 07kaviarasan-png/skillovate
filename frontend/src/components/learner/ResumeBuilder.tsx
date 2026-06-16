"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
  technologies: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
  score: string;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  objective: string;
  education: Education[];
  skills: string;
  projects: Project[];
  experience: Experience[];
}

export function ResumeBuilder() {
  const { user } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  
  const [formData, setFormData] = useState<ResumeData>({
    personal: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    objective: "",
    education: [],
    skills: "",
    projects: [],
    experience: [],
  });

  const [template, setTemplate] = useState<"classic" | "modern" | "minimal" | "creative">("modern");
  const [isGenerating, setIsGenerating] = useState(false);

  // Handlers for simple string fields
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      personal: { ...prev.personal, [e.target.name]: e.target.value }
    }));
  };

  // Handlers for array fields
  const addArrayItem = (field: "education" | "projects" | "experience", defaultItem: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { ...defaultItem, id: Date.now().toString() }]
    }));
  };

  const updateArrayItem = (field: "education" | "projects" | "experience", id: string, key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map(item => item.id === id ? { ...item, [key]: value } : item)
    }));
  };

  const removeArrayItem = (field: "education" | "projects" | "experience", id: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter(item => item.id !== id)
    }));
  };

  const handleAIImprove = async () => {
    setIsGenerating(true);
    try {
      // Convert structured data to simple text for AI
      const edText = formData.education.map(e => `${e.degree} at ${e.institution} (${e.year}) - ${e.score}`).join("\n");
      const expText = formData.experience.map(e => `${e.role} at ${e.company} (${e.duration})\n${e.description}`).join("\n\n");
      const projText = formData.projects.map(p => `${p.title}\nTech: ${p.technologies}\n${p.description}`).join("\n\n");
      
      const fullExp = expText + "\n\nProjects:\n" + projText;

      const res = await api.post("/ai/resume/improve", {
        objective: formData.objective,
        education: edText,
        skills: formData.skills,
        experience: fullExp
      });

      // Update objective and skills directly.
      // For experience, we'll append a note or override a general text, but since our UI is structured,
      // it's safer to just update the objective and skills and let the user see the overall polish.
      setFormData(prev => ({
        ...prev,
        objective: res.data.objective || prev.objective,
        skills: res.data.skills || prev.skills,
        // We won't strictly override the structured arrays to prevent losing data, 
        // but we can alert the user.
      }));
      alert("AI has polished your Objective and Skills sections! Structured sections were kept intact.");
    } catch (err) {
      console.error(err);
      alert("Failed to improve resume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;
    
    setIsGenerating(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       [0.2, 0.2, 0.2, 0.2],
        filename:     `${formData.personal.name || 'Resume'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", overflowX: "auto" }}>
        {["Personal", "Objective", "Education", "Skills", "Experience", "Projects", "Preview"].map((label, idx) => {
          const current = step === idx + 1;
          const completed = step > idx + 1;
          return (
            <div 
              key={idx} 
              style={{ 
                padding: "8px 12px", 
                borderRadius: "8px", 
                fontSize: "12px", 
                fontWeight: 600,
                background: current ? "var(--accent)" : completed ? "var(--teal-l)" : "var(--bg)",
                color: current ? "#fff" : completed ? "var(--teal)" : "var(--muted)",
                whiteSpace: "nowrap",
                cursor: "pointer"
              }}
              onClick={() => setStep(idx + 1)}
            >
              {idx + 1}. {label}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="card" style={{ padding: "30px", animation: "fadeIn 0.3s ease" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Personal Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div><label className="lbl">Full Name</label><input type="text" className="fi" name="name" value={formData.personal.name} onChange={handlePersonalChange} /></div>
              <div><label className="lbl">Email Address</label><input type="email" className="fi" name="email" value={formData.personal.email} onChange={handlePersonalChange} /></div>
              <div><label className="lbl">Phone Number</label><input type="text" className="fi" name="phone" value={formData.personal.phone} onChange={handlePersonalChange} /></div>
              <div><label className="lbl">LinkedIn URL</label><input type="text" className="fi" name="linkedin" value={formData.personal.linkedin} onChange={handlePersonalChange} placeholder="linkedin.com/in/username" /></div>
              <div><label className="lbl">GitHub URL</label><input type="text" className="fi" name="github" value={formData.personal.github} onChange={handlePersonalChange} placeholder="github.com/username" /></div>
              <div><label className="lbl">Portfolio Website</label><input type="text" className="fi" name="portfolio" value={formData.personal.portfolio} onChange={handlePersonalChange} placeholder="yourwebsite.com" /></div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="card" style={{ padding: "30px", animation: "fadeIn 0.3s ease" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Professional Objective</h3>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>Write a short, impactful summary of your career goals and what you bring to the table.</p>
            <textarea 
              className="fi" 
              value={formData.objective} 
              onChange={e => setFormData({...formData, objective: e.target.value})} 
              style={{ height: "150px", resize: "vertical" }} 
              placeholder="Highly motivated Software Engineering student with a passion for building scalable web applications..."
            />
            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <button className="btn" onClick={handleAIImprove} disabled={isGenerating || !formData.objective} style={{ color: "var(--purple)", background: "var(--purple-l)" }}>
                {isGenerating ? "Refining..." : "✨ Refine Objective with AI"}
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="card" style={{ padding: "30px", animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Education</h3>
              <button className="btn btn-o" onClick={() => addArrayItem("education", { institution: "", degree: "", year: "", score: "" })}>+ Add Education</button>
            </div>
            {formData.education.length === 0 && <p style={{ color: "var(--muted)", fontSize: "14px" }}>No education added yet.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {formData.education.map((ed, i) => (
                <div key={ed.id} style={{ background: "var(--bg)", padding: "20px", borderRadius: "12px", position: "relative" }}>
                  <button onClick={() => removeArrayItem("education", ed.id)} style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "18px" }}>×</button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "8px" }}>
                    <div><label className="lbl">Institution Name</label><input type="text" className="fi" value={ed.institution} onChange={e => updateArrayItem("education", ed.id, "institution", e.target.value)} placeholder="e.g. Stanford University" /></div>
                    <div><label className="lbl">Degree / Course</label><input type="text" className="fi" value={ed.degree} onChange={e => updateArrayItem("education", ed.id, "degree", e.target.value)} placeholder="e.g. B.Tech Computer Science" /></div>
                    <div><label className="lbl">Graduation Year</label><input type="text" className="fi" value={ed.year} onChange={e => updateArrayItem("education", ed.id, "year", e.target.value)} placeholder="e.g. 2024" /></div>
                    <div><label className="lbl">CGPA / Percentage</label><input type="text" className="fi" value={ed.score} onChange={e => updateArrayItem("education", ed.id, "score", e.target.value)} placeholder="e.g. 8.5 CGPA" /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="card" style={{ padding: "30px", animation: "fadeIn 0.3s ease" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Technical Skills</h3>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>List your skills. You can categorize them (e.g., Languages: Python, Java | Frameworks: React, Django).</p>
            <textarea 
              className="fi" 
              value={formData.skills} 
              onChange={e => setFormData({...formData, skills: e.target.value})} 
              style={{ height: "150px", resize: "vertical" }} 
              placeholder="Languages: C++, JavaScript, Python&#10;Frontend: React, HTML, CSS&#10;Backend: Node.js, Express, MongoDB"
            />
          </div>
        );
      case 5:
        return (
          <div className="card" style={{ padding: "30px", animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Work Experience</h3>
              <button className="btn btn-o" onClick={() => addArrayItem("experience", { role: "", company: "", duration: "", description: "" })}>+ Add Experience</button>
            </div>
            {formData.experience.length === 0 && <p style={{ color: "var(--muted)", fontSize: "14px" }}>No experience added yet.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {formData.experience.map((exp, i) => (
                <div key={exp.id} style={{ background: "var(--bg)", padding: "20px", borderRadius: "12px", position: "relative" }}>
                  <button onClick={() => removeArrayItem("experience", exp.id)} style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "18px" }}>×</button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "8px" }}>
                    <div><label className="lbl">Job Title / Role</label><input type="text" className="fi" value={exp.role} onChange={e => updateArrayItem("experience", exp.id, "role", e.target.value)} placeholder="e.g. Software Engineer Intern" /></div>
                    <div><label className="lbl">Company Name</label><input type="text" className="fi" value={exp.company} onChange={e => updateArrayItem("experience", exp.id, "company", e.target.value)} placeholder="e.g. Google" /></div>
                    <div style={{ gridColumn: "span 2" }}><label className="lbl">Duration</label><input type="text" className="fi" value={exp.duration} onChange={e => updateArrayItem("experience", exp.id, "duration", e.target.value)} placeholder="e.g. May 2023 - Aug 2023" /></div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label className="lbl">Description & Achievements</label>
                      <textarea className="fi" value={exp.description} onChange={e => updateArrayItem("experience", exp.id, "description", e.target.value)} style={{ height: "100px" }} placeholder="- Developed a REST API using Node.js...&#10;- Improved query performance by 20%..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="card" style={{ padding: "30px", animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Projects</h3>
              <button className="btn btn-o" onClick={() => addArrayItem("projects", { title: "", description: "", link: "", technologies: "" })}>+ Add Project</button>
            </div>
            {formData.projects.length === 0 && <p style={{ color: "var(--muted)", fontSize: "14px" }}>No projects added yet.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {formData.projects.map((proj, i) => (
                <div key={proj.id} style={{ background: "var(--bg)", padding: "20px", borderRadius: "12px", position: "relative" }}>
                  <button onClick={() => removeArrayItem("projects", proj.id)} style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "18px" }}>×</button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "8px" }}>
                    <div><label className="lbl">Project Title</label><input type="text" className="fi" value={proj.title} onChange={e => updateArrayItem("projects", proj.id, "title", e.target.value)} placeholder="e.g. E-Commerce Platform" /></div>
                    <div><label className="lbl">Project Link (GitHub/Live)</label><input type="text" className="fi" value={proj.link} onChange={e => updateArrayItem("projects", proj.id, "link", e.target.value)} placeholder="e.g. github.com/user/project" /></div>
                    <div style={{ gridColumn: "span 2" }}><label className="lbl">Technologies Used</label><input type="text" className="fi" value={proj.technologies} onChange={e => updateArrayItem("projects", proj.id, "technologies", e.target.value)} placeholder="e.g. React, Node.js, MongoDB" /></div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label className="lbl">Project Description</label>
                      <textarea className="fi" value={proj.description} onChange={e => updateArrayItem("projects", proj.id, "description", e.target.value)} style={{ height: "100px" }} placeholder="Describe what the project does, key features, and your specific contributions..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div className="card" style={{ padding: "30px", marginBottom: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Choose Template & Export</h3>
                  <p style={{ fontSize: "14px", color: "var(--muted)" }}>Select a design template and download your AI-enhanced resume as a PDF.</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={handleAIImprove} disabled={isGenerating} className="btn" style={{ background: "var(--purple)", color: "white", padding: "10px 20px" }}>
                    {isGenerating ? "Analyzing..." : "✨ Final AI Polish"}
                  </button>
                  <button className="btn btn-p" disabled={isGenerating} onClick={handlePrint} style={{ padding: "10px 24px" }}>
                    {isGenerating ? "Exporting..." : "Download PDF"}
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", marginTop: "24px", overflowX: "auto", paddingBottom: "8px" }}>
                {[
                  { id: "classic", name: "Classic Professional" },
                  { id: "modern", name: "Modern Tech" },
                  { id: "minimal", name: "Clean Minimalist" },
                  { id: "creative", name: "Creative Bold" }
                ].map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => setTemplate(t.id as any)}
                    style={{ 
                      padding: "16px 20px", 
                      borderRadius: "10px", 
                      border: template === t.id ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: template === t.id ? "var(--bg)" : "transparent",
                      cursor: "pointer",
                      minWidth: "160px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: template === t.id ? "var(--accent)" : "var(--text)",
                      transition: "all 0.2s"
                    }}
                  >
                    {t.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="resume-preview-container" style={{ background: "#e5e7eb", padding: "40px", borderRadius: "12px", display: "flex", justifyContent: "center" }}>
              <div id="resume-preview" className={`resume-template-${template}`} style={{ background: "white", width: "100%", maxWidth: "800px", minHeight: "1056px", padding: "40px 50px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
                {renderResumeTemplate()}
              </div>
            </div>
          </div>
        );
    }
  };

  const renderResumeTemplate = () => {
    // Template specific classes are handled via CSS below.
    // The DOM structure remains relatively standard, CSS modifies the layout.
    return (
      <div className="resume-content">
        <header className="resume-header">
          <h1 className="r-name">{formData.personal.name || "Your Name"}</h1>
          <div className="r-contact">
            {formData.personal.email && <span>{formData.personal.email}</span>}
            {formData.personal.phone && <span>{formData.personal.phone}</span>}
            {formData.personal.linkedin && <span>{formData.personal.linkedin}</span>}
            {formData.personal.github && <span>{formData.personal.github}</span>}
            {formData.personal.portfolio && <span>{formData.personal.portfolio}</span>}
          </div>
        </header>

        {formData.objective && (
          <section className="r-section">
            <h2 className="r-section-title">Objective</h2>
            <div className="r-section-content">{formData.objective}</div>
          </section>
        )}

        <div className="r-body">
          <div className="r-main">
            {formData.experience.length > 0 && (
              <section className="r-section">
                <h2 className="r-section-title">Experience</h2>
                {formData.experience.map(exp => (
                  <div key={exp.id} className="r-item">
                    <div className="r-item-header">
                      <h3 className="r-item-title">{exp.role}</h3>
                      <span className="r-item-date">{exp.duration}</span>
                    </div>
                    <div className="r-item-subtitle">{exp.company}</div>
                    <div className="r-item-desc" style={{ whiteSpace: "pre-wrap" }}>{exp.description}</div>
                  </div>
                ))}
              </section>
            )}

            {formData.projects.length > 0 && (
              <section className="r-section">
                <h2 className="r-section-title">Projects</h2>
                {formData.projects.map(proj => (
                  <div key={proj.id} className="r-item">
                    <div className="r-item-header">
                      <h3 className="r-item-title">{proj.title}</h3>
                      {proj.link && <span className="r-item-link">{proj.link}</span>}
                    </div>
                    {proj.technologies && <div className="r-item-subtitle" style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Tech: {proj.technologies}</div>}
                    <div className="r-item-desc" style={{ whiteSpace: "pre-wrap" }}>{proj.description}</div>
                  </div>
                ))}
              </section>
            )}
          </div>

          <div className="r-sidebar">
            {formData.education.length > 0 && (
              <section className="r-section">
                <h2 className="r-section-title">Education</h2>
                {formData.education.map(ed => (
                  <div key={ed.id} className="r-item">
                    <div className="r-item-header">
                      <h3 className="r-item-title">{ed.degree}</h3>
                      <span className="r-item-date">{ed.year}</span>
                    </div>
                    <div className="r-item-subtitle">{ed.institution}</div>
                    {ed.score && <div className="r-item-desc">Score: {ed.score}</div>}
                  </div>
                ))}
              </section>
            )}

            {formData.skills && (
              <section className="r-section">
                <h2 className="r-section-title">Skills</h2>
                <div className="r-section-content" style={{ whiteSpace: "pre-wrap" }}>{formData.skills}</div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="screen active" style={{ padding: "40px" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; }
          body { visibility: hidden; background: white; }
          #resume-preview { 
            visibility: visible; 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100% !important; 
            max-width: none !important; 
            box-shadow: none !important; 
            margin: 0 !important; 
            padding: 40px !important; 
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        /* Base Resume Styles */
        .resume-content { font-family: 'Inter', sans-serif; color: #333; line-height: 1.5; }
        .r-name { margin: 0 0 8px 0; line-height: 1.2; }
        .r-contact { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: #555; }
        .r-contact span { position: relative; }
        .r-contact span:not(:last-child)::after { content: "•"; position: absolute; right: -8px; color: #ccc; }
        .r-section { margin-bottom: 24px; }
        .r-section-title { margin: 0 0 12px 0; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #111; }
        .r-section-content { font-size: 13px; color: #444; }
        .r-item { margin-bottom: 16px; }
        .r-item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .r-item-title { margin: 0; font-size: 15px; font-weight: 600; color: #222; }
        .r-item-date, .r-item-link { font-size: 13px; color: #666; font-weight: 500; }
        .r-item-subtitle { font-size: 14px; font-weight: 500; color: #444; margin-bottom: 6px; }
        .r-item-desc { font-size: 13px; color: #444; }

        /* Template: Classic */
        .resume-template-classic .resume-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 24px; }
        .resume-template-classic .r-name { font-size: 32px; font-family: 'Times New Roman', serif; }
        .resume-template-classic .r-contact { justify-content: center; }
        .resume-template-classic .r-section-title { border-bottom: 1px solid #ccc; padding-bottom: 4px; font-family: 'Times New Roman', serif; }
        .resume-template-classic .r-body { display: block; }
        
        /* Template: Modern (Two Column) */
        .resume-template-modern .resume-header { margin-bottom: 32px; }
        .resume-template-modern .r-name { font-size: 36px; font-weight: 900; color: #0f172a; letter-spacing: -1px; }
        .resume-template-modern .r-contact span:not(:last-child)::after { content: "|"; color: #cbd5e1; }
        .resume-template-modern .r-section-title { color: #2563eb; }
        .resume-template-modern .r-body { display: grid; grid-template-columns: 2fr 1fr; gap: 40px; }
        .resume-template-modern .r-sidebar .r-section-title { color: #0f172a; }

        /* Template: Minimal */
        .resume-template-minimal .resume-header { margin-bottom: 40px; }
        .resume-template-minimal .r-name { font-size: 28px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; }
        .resume-template-minimal .r-contact { flex-direction: column; gap: 4px; }
        .resume-template-minimal .r-contact span:not(:last-child)::after { display: none; }
        .resume-template-minimal .r-section-title { font-size: 12px; letter-spacing: 2px; color: #9ca3af; margin-bottom: 16px; }
        .resume-template-minimal .r-item-title { font-weight: 500; }

        /* Template: Creative */
        .resume-template-creative { background: #f8fafc; }
        .resume-template-creative .resume-header { background: #0f172a; color: white; padding: 40px; margin: -40px -50px 32px -50px; }
        .resume-template-creative .r-name { color: white; font-size: 40px; }
        .resume-template-creative .r-contact { color: #94a3b8; }
        .resume-template-creative .r-section-title { color: #0ea5e9; border-left: 4px solid #0ea5e9; padding-left: 12px; }
        .resume-template-creative .r-body { display: grid; grid-template-columns: 1fr 2fr; gap: 40px; }
        .resume-template-creative .r-sidebar { order: -1; }
      `}} />
      
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>AI Resume Builder</h2>
        <p style={{ color: "var(--muted)", fontSize: "15px" }}>Follow the steps to craft a standout resume. AI is here to help.</p>
      </div>

      {renderStepIndicator()}

      <div style={{ position: "relative" }}>
        {renderCurrentStep()}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
        <button 
          className="btn" 
          disabled={step === 1} 
          onClick={() => setStep(s => Math.max(1, s - 1))}
        >
          ← Previous Step
        </button>
        {step < totalSteps && (
          <button 
            className="btn btn-p" 
            onClick={() => setStep(s => Math.min(totalSteps, s + 1))}
          >
            Next Step →
          </button>
        )}
      </div>

    </div>
  );
}
