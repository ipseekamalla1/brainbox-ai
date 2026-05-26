"use client";

export default function AnalyticsSection() {
  const stats = [
    { num: "87.4%", label: "Average Score", sub: "↑ 3.2% this week" },
    { num: "42", label: "Quizzes Done", sub: "↑ 8 this month" },
    { num: "14d", label: "Study Streak", sub: "🔥 Personal best" },
    { num: "#12", label: "Class Rank", sub: "Top 15%" },
  ];

  const points = [
    "Interactive performance charts across all courses",
    "AI-identified weak topics with targeted practice",
    "Longitudinal progress tracking and grade trends",
    "Class rankings and anonymous peer comparison",
  ];

  return (
    <section className="analytics-hero">

      {/* background */}
      <img
        src="https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg?_gl=1*1aecexl*_ga*NTcwMzU1MTg2LjE3NzkyMDM0MzE.*_ga_8JE65Q40S6*czE3Nzk0NzU2NTckbzIkZzEkdDE3Nzk0NzYwNzEkajUzJGwwJGgw"
        alt=""
        className="analytics-bg-img"
        aria-hidden="true"
      />

      <div className="analytics-overlay">

        <div className="analytics-container">

          {/* LEFT SIDE */}
          <div className="analytics-content reveal">

            <span className="analytics-label">
              Smart Analytics
            </span>

            <h2 className="f-display analytics-title">
              See exactly where <br />
              to <em className="text-gold">improve.</em>
            </h2>

            <p className="f-body analytics-desc">
              Brainbox AI doesn’t just show you scores — it pinpoints your weak areas,
              tracks your progress week by week, and tells you exactly where to focus next.
            </p>

            <ul className="analytics-list">
              {points.map((item) => (
                <li key={item}>
                  <span>✦</span>
                  {item}
                </li>
              ))}
            </ul>

          </div>

          {/* RIGHT SIDE */}
          <div className="analytics-grid reveal">

            {stats.map((m) => (
              <div key={m.label} className="analytics-card">

                <div className="analytics-number">
                  {m.num}
                </div>

                <div className="analytics-label-small">
                  {m.label}
                </div>

                <div className="analytics-sub">
                  {m.sub}
                </div>

              </div>
            ))}

          </div>

        </div>
      </div>

    </section>
  );
}