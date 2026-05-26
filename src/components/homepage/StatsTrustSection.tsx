"use client";

import "@/css/home.css";
import { motion } from "framer-motion";
import CountUp from "react-countup";

const stats = [
  { value: 6, label: "AI Features", suffix: "+" },
  { value: 3, label: "User Roles", suffix: "" },
  { value: 99.9, label: "Uptime", suffix: "%" },
];

const trustBadges = [
  "🔒 SOC 2 Compliant",
  "🌍 GDPR Ready",
  "⚡ Secure by Design",
];

export default function StatsTrustSection() {
  return (
    <section className="stats-section">

      {/* IMAGE */}
      <motion.div
        className="stats-image-wrap"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.img
          src="https://images.pexels.com/photos/6958506/pexels-photo-6958506.jpeg?_gl=1*1kdc0lx*_ga*NTcwMzU1MTg2LjE3NzkyMDM0MzE.*_ga_8JE65Q40S6*czE3Nzk0NzU2NTckbzIkZzEkdDE3Nzk0NzY5MzkkajMkbDAkaDA."
          alt="University campus"
          className="stats-image"
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </motion.div>

      {/* CONTENT */}
      <div className="stats-content">

        {/* STATS */}
        <div className="stats-grid">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="stats-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="stats-value">
                <CountUp end={s.value} duration={2} />
                {s.suffix}
              </div>
              <div className="stats-label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* BADGES */}
        <motion.div
          className="trust-badges"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {trustBadges.map((b, i) => (
            <motion.span
              key={i}
              className="badge"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {b}
            </motion.span>
          ))}
        </motion.div>

      </div>
    </section>
  );
}