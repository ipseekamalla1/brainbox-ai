import React from "react";
import "@/css/home.css";

const stats = [
  { value: "6+", label: "AI Features" },
  { value: "3", label: "User Roles" },
  { value: "∞", label: "Scalability" },
];

const trustBadges = [
  "🔒 SOC 2 Compliant",
  "🌍 GDPR Ready",
  "⚡ 99.9% Uptime",
];

export default function StatsTrustSection() {
  return (
    <section className="stats-section">

      {/* Wide image */}
      <div className="stats-image-wrap">
        <img
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1800&q=80"
          alt="University campus"
          className="stats-image"
        />
      </div>

      {/* Stats + badges */}
      <div className="stats-content">

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stats-card">
              <div className="stats-value">{s.value}</div>
              <div className="stats-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="trust-badges">
          {trustBadges.map((b, i) => (
            <span key={i} className="badge">
              {b}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}