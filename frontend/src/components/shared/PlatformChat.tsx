"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export function PlatformChat() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<{sender: string, text: string, isMe: boolean}[]>([
    { sender: "System", text: "Welcome to the Skillovate Chat. You can start messaging your corresponding contacts here.", isMe: false }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: user?.name || "You", text: input, isMe: true }]);
    setInput("");
    
    // Mock response after 1 second
    setTimeout(() => {
      let responder = "Admin";
      if (user?.role === "student") responder = "Faculty";
      else if (user?.role === "college_admin") responder = "Skillovate Support";
      
      setMessages(prev => [...prev, { sender: responder, text: `Thank you for your message. A ${responder.toLowerCase()} will reply shortly.`, isMe: false }]);
    }, 1000);
  };

  let contactName = "Admin";
  if (user?.role === "student") contactName = "Faculty";
  else if (user?.role === "college_admin") contactName = "Support";

  return (
    <div className="screen active" style={{ padding: "40px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>Messages</h2>
        <p style={{ color: "var(--muted)", fontSize: "15px" }}>Communicate directly with your {contactName.toLowerCase()}.</p>
      </div>

      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "800px", margin: "0 auto", width: "100%", height: "calc(100vh - 200px)" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", fontWeight: 700, color: "var(--text)" }}>
          Chatting with {contactName}
        </div>
        
        <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px", textAlign: m.isMe ? "right" : "left" }}>
                {m.sender}
              </div>
              <div style={{ 
                padding: "12px 16px", 
                borderRadius: "12px", 
                background: m.isMe ? "var(--accent)" : "var(--bg)", 
                color: m.isMe ? "white" : "var(--text)",
                border: m.isMe ? "none" : "1px solid var(--border)",
                borderBottomRightRadius: m.isMe ? "4px" : "12px",
                borderBottomLeftRadius: m.isMe ? "12px" : "4px"
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "20px", borderTop: "1px solid var(--border)", display: "flex", gap: "12px" }}>
          <input 
            type="text" 
            className="fi" 
            placeholder="Type your message..." 
            style={{ marginBottom: 0 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="btn btn-p" onClick={handleSend} style={{ padding: "0 24px" }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
