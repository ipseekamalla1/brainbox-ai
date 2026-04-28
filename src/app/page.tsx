// src/app/page.tsx — Landing Page (Home) — Themed to globals.css

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ─── Data ───────────────────────────────────────────

const features = [
  {
    icon: "🧠",
    title: "AI Tutor",
    description:
      "Ask anything. Get university-level explanations powered by GPT-4 — with examples, analogies, and step-by-step breakdowns.",
    tag: "GPT-4 Powered",
    glowClass: "glow-1",
  },
  {
    icon: "📝",
    title: "Smart Quizzes",
    description:
      "Timer-based MCQ & short-answer quizzes with instant auto-grading. AI generates quizzes from your notes automatically.",
    tag: "Auto-graded",
    glowClass: "glow-2",
  },
  {
    icon: "🎓",
    title: "Exam Engine",
    description:
      "Full university-level exams with sections, time limits, and anti-cheating controls. Auto-submit on timeout.",
    tag: "Anti-cheat",
    glowClass: "glow-3",
  },
  {
    icon: "📊",
    title: "Analytics",
    description:
      "Track performance with interactive charts. See quiz scores, exam results, weak topics, and progress over time.",
    tag: "Real-time",
    glowClass: "glow-4",
  },
  {
    icon: "📚",
    title: "Notes Hub",
    description:
      "Upload PDFs, DOCX, and presentations. AI summarizes your notes instantly. Everything organized by course.",
    tag: "AI Summary",
    glowClass: "glow-5",
  },
  {
    icon: "🎥",
    title: "Video Learning",
    description:
      "Watch course videos with progress tracking per user. Pick up exactly where you left off.",
    tag: "Progress sync",
    glowClass: "glow-6",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Sign Up & Choose Your Role",
    description: "Create an account as a Student, Teacher, or Admin. Each role gets a tailored dashboard.",
  },
  {
    step: "02",
    title: "Enroll in Courses",
    description: "Browse available courses, access notes, videos, quizzes, and exams curated by your teachers.",
  },
  {
    step: "03",
    title: "Learn with AI",
    description: "Use the AI tutor for help, auto-generate quizzes from notes, and get instant feedback on your answers.",
  },
  {
    step: "04",
    title: "Track Your Progress",
    description: "See your scores, grades, and performance trends. Identify weak areas and improve with targeted practice.",
  },
];

const testimonials = [
  {
    quote: "Brainbox AI transformed how I study. The AI tutor explains things better than most textbooks.",
    name: "Priya S.",
    role: "Computer Science Student",
    initials: "PS",
  },
  {
    quote: "Creating quizzes used to take hours. Now I generate them from my lecture notes in seconds.",
    name: "Dr. James K.",
    role: "Professor of Mathematics",
    initials: "JK",
  },
  {
    quote: "The analytics dashboard gives me a clear picture of how my class is performing at a glance.",
    name: "Prof. Sarah L.",
    role: "Department Head, Physics",
    initials: "SL",
  },
];

const stats = [
  { value: "6+", label: "AI Features" },
  { value: "3",  label: "User Roles"  },
  { value: "∞",  label: "Scalability" },
];

const metrics = [
  { label: "Overall Score", value: "87.4%", change: "↑ 3.2% this week", positive: true  },
  { label: "Quizzes Done",  value: "42",    change: "↑ 8 this month",   positive: true  },
  { label: "Study Streak",  value: "14d",   change: "🔥 Personal best",  positive: false },
];

const navItems = [
  { icon: "📊", label: "Analytics", active: true  },
  { icon: "🧠", label: "AI Tutor",  active: false },
  { icon: "📝", label: "Quizzes",   active: false },
  { icon: "🎓", label: "Exams",     active: false },
  { icon: "📚", label: "Notes",     active: false },
  { icon: "🎥", label: "Videos",    active: false },
];

const trustedBy = [
  "MIT OpenCourseWare", "Stanford Online", "Harvard Extension", "Coursera EDU", "EdX University",
];

const barData   = [62, 75, 68, 88, 72, 91, 87];
const barDays   = ["M","T","W","T","F","S","S"];

const weakTopics = [
  { name: "Dynamic Programming", score: 48, hi: false },
  { name: "Graph Traversal",     score: 63, hi: false },
  { name: "Hash Maps",           score: 77, hi: false },
  { name: "Binary Search",       score: 91, hi: true  },
];

const scoreRings = [
  { label: "Quiz Avg", pct: 84,   text: "84%"  },
  { label: "Exam Avg", pct: 79,   text: "79%"  },
  { label: "Rank",     pct: null, text: "#12"  },
];

const chartDots   = [{ cx:160,cy:40 },{ cx:280,cy:30 },{ cx:420,cy:16 },{ cx:600,cy:6 }];
const promptChips = ["Generate a quiz on this","Explain with analogy","Give me practice problems"];
const analyticsBullets = [
  { icon: "📊", text: "Interactive performance charts across all courses" },
  { icon: "🎯", text: "AI-identified weak topics with targeted practice"  },
  { icon: "📈", text: "Longitudinal progress tracking and grade trends"   },
  { icon: "🏆", text: "Class rankings and peer comparison (anonymous)"    },
];
const trustBadges   = ["🔒 SOC 2 Compliant","🌍 GDPR Ready","⚡ 99.9% Uptime"];
const floatAvatars  = [
  { initials:"PS", hue:42  },
  { initials:"JK", hue:200 },
  { initials:"AL", hue:280 },
  { initials:"MR", hue:340 },
  { initials:"TD", hue:120 },
];

// ─── All CSS — uses your globals.css variables exactly ─────────────────
const css = `
  /* ── Animated dot grid ── */
  .bb-grid {
    position: absolute; inset: 0;
    background-image:
      radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px);
    background-size: 28px 28px;
    -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 0%, black 30%, transparent 100%);
    mask-image: radial-gradient(ellipse 80% 70% at 50% 0%, black 30%, transparent 100%);
    opacity: 0.6;
    animation: bbGrid 22s ease-in-out infinite alternate;
  }
  @keyframes bbGrid { from{transform:translateY(0)} to{transform:translateY(-18px)} }

  /* ── Glow orbs using your primary color ── */
  .bb-orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }
  .bb-o1 {
    width:700px; height:700px;
    background: radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%);
    top:-260px; left:50%; transform:translateX(-50%);
    animation:bbo1 10s ease-in-out infinite alternate;
  }
  .bb-o2 {
    width:400px; height:400px;
    background: radial-gradient(circle, hsl(var(--primary) / 0.07) 0%, transparent 70%);
    top:60px; right:-120px;
    animation:bbo2 13s ease-in-out infinite alternate;
  }
  .bb-o3 {
    width:300px; height:300px;
    background: radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%);
    top:220px; left:-80px;
    animation:bbo3 15s ease-in-out infinite alternate;
  }
  @keyframes bbo1 { from{transform:translateX(-50%) translateY(0)} to{transform:translateX(-50%) translateY(-26px)} }
  @keyframes bbo2 { from{transform:translateY(0)} to{transform:translateY(-32px)} }
  @keyframes bbo3 { from{transform:translateY(0)} to{transform:translateY(20px)} }

  /* ── Staggered hero fade-up ── */
  @keyframes bbUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  .bb-a0{animation:bbUp .8s 0s   ease both;}
  .bb-a1{animation:bbUp .8s .12s ease both;}
  .bb-a2{animation:bbUp .8s .22s ease both;}
  .bb-a3{animation:bbUp .8s .32s ease both;}
  .bb-a4{animation:bbUp .8s .42s ease both;}
  .bb-a5{animation:bbUp .8s .54s ease both;}

  /* ── Pulse ── */
  @keyframes bbPulse{0%,100%{opacity:1}50%{opacity:.2}}
  .bb-pulse{animation:bbPulse 2.2s ease-in-out infinite;}

  /* ── Typing dots ── */
  @keyframes bbType{0%,60%,100%{transform:translateY(0);opacity:.3}30%{transform:translateY(-6px);opacity:1}}
  .bb-td{animation:bbType 1.4s ease-in-out infinite;}
  .bb-td:nth-child(2){animation-delay:.2s;}
  .bb-td:nth-child(3){animation-delay:.4s;}

  /* ── Float cards ── */
  @keyframes bbFa{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(-2deg)}}
  @keyframes bbFb{0%,100%{transform:translateY(0) rotate(1.5deg)}50%{transform:translateY(-13px) rotate(1.5deg)}}
  @keyframes bbFc{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-8px) rotate(-1deg)}}
  .bb-fa{animation:bbFa 5s ease-in-out infinite;}
  .bb-fb{animation:bbFb 6.2s .5s ease-in-out infinite;}
  .bb-fc{animation:bbFc 7s 1s ease-in-out infinite;}

  /* ── Marquee ── */
  @keyframes bbMq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  .bb-mq{animation:bbMq 20s linear infinite;}

  /* ── Scroll reveal ── */
  .bb-rev{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease;}
  .bb-rev.visible{opacity:1;transform:translateY(0);}
  .bb-rev.d1{transition-delay:.1s;}
  .bb-rev.d2{transition-delay:.2s;}

  /* ── Gradient text — uses your primary ── */
  .bb-g {
    background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(42 90% 70%) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  /* ── Divider ── */
  .bb-div {
    height:1px;
    background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.35), transparent);
  }

  /* ── CTA grid bg ── */
  .bb-cg {
    position:absolute; inset:0;
    background-image:
      radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.5;
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%);
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%);
  }

  /* ── Feature card — CSS :hover only ── */
  .bb-fc-card {
    position:relative; overflow:hidden;
    background: hsl(var(--card));
    transition: background .3s, border-color .3s;
    border: 1px solid hsl(var(--border));
  }
  .bb-fc-card:hover { background: hsl(var(--secondary)); border-color: hsl(var(--primary) / 0.35); }
  .bb-fc-card::after {
    content:''; position:absolute; top:-80px; right:-80px;
    width:200px; height:200px; border-radius:50%; filter:blur(55px);
    opacity:0; transition:opacity .4s; pointer-events:none;
    background: hsl(var(--primary) / 0.18);
  }
  .bb-fc-card:hover::after { opacity:1; }
  .bb-fc-icon { transition:transform .3s; }
  .bb-fc-card:hover .bb-fc-icon { transform:scale(1.1); }

  /* ── Step number — CSS :hover only ── */
  .bb-step {
    background: hsl(var(--secondary));
    border: 1px solid hsl(var(--border));
    color: hsl(var(--primary));
    transition: background .25s, color .25s, border-color .25s;
  }
  .bb-step:hover {
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border-color: transparent;
  }

  /* ── Testimonial card — CSS :hover only ── */
  .bb-tcard {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    transition: border-color .3s, transform .3s;
  }
  .bb-tcard:hover { border-color: hsl(var(--primary) / 0.4); transform:translateY(-4px); }

  /* ── Primary button — CSS :hover only ── */
  .bb-btn1 {
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    box-shadow: 0 6px 28px hsl(var(--primary) / 0.3);
    transition: opacity .2s, transform .2s, box-shadow .2s;
  }
  .bb-btn1:hover { opacity: .92; transform:translateY(-2px); box-shadow: 0 10px 40px hsl(var(--primary) / 0.4); }

  /* ── Secondary button — CSS :hover only ── */
  .bb-btn2 {
    border: 1px solid hsl(var(--border));
    background: hsl(var(--secondary));
    color: hsl(var(--foreground));
    transition: background .2s, border-color .2s;
  }
  .bb-btn2:hover { background: hsl(var(--muted)); border-color: hsl(var(--primary) / 0.3); }

  /* ── Badge chip ── */
  .bb-badge {
    border: 1px solid hsl(var(--primary) / 0.3);
    background: hsl(var(--primary) / 0.08);
    color: hsl(var(--primary));
  }

  /* ── Eyebrow label ── */
  .bb-eye { color: hsl(var(--primary)); }
  .bb-eye-line { background: hsl(var(--primary)); }

  /* ── Metric card ── */
  .bb-metric {
    background: hsl(var(--secondary));
    border: 1px solid hsl(var(--border));
  }

  /* ── Active nav item ── */
  .bb-nav-active {
    background: hsl(var(--primary) / 0.12);
    border: 1px solid hsl(var(--primary) / 0.25);
    color: hsl(var(--primary));
  }
  .bb-nav-inactive { color: hsl(var(--muted-foreground)); }

  /* ── Prompt chip ── */
  .bb-chip {
    background: hsl(var(--secondary));
    border: 1px solid hsl(var(--border));
    color: hsl(var(--muted-foreground));
  }

  /* ── Code block ── */
  .bb-code {
    background: hsl(var(--background));
    border-left: 2px solid hsl(var(--primary));
    color: hsl(var(--primary));
  }

  /* ── Chart line color ── */
  .bb-chart-stroke { stroke: hsl(var(--primary)); }

  /* ── Bar highlight ── */
  .bb-bar-hi { background: hsl(var(--primary)); }
  .bb-bar-lo { background: hsl(var(--primary) / 0.25); }

  /* ── Progress bar ── */
  .bb-prog-lo  { background: hsl(var(--muted-foreground) / 0.5); }
  .bb-prog-hi  { background: hsl(var(--primary)); }

  /* ── Ring stroke ── */
  .bb-ring { stroke: hsl(var(--primary)); }

  /* ── Window chrome dots ── */
  .bb-dot-r{background:#ff5f57;} .bb-dot-y{background:#febc2e;} .bb-dot-g{background:#28c840;}

  /* ── Scrollbar matches your theme ── */
  ::-webkit-scrollbar{width:6px;}
  ::-webkit-scrollbar-track{background:hsl(var(--background));}
  ::-webkit-scrollbar-thumb{background:hsl(var(--border));border-radius:3px;}
  ::-webkit-scrollbar-thumb:hover{background:hsl(var(--primary)/0.5);}
`;

// ─── Page ─────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Navbar />

      <main>

        {/* ══════════════════════════════
            HERO
        ══════════════════════════════ */}
        <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden">
          <div className="bb-grid" />
          <div className="bb-orb bb-o1" />
          <div className="bb-orb bb-o2" />
          <div className="bb-orb bb-o3" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-28 pb-12">

            {/* Badge */}
            <div className="bb-a0 bb-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bb-pulse" style={{ background:"hsl(var(--primary))" }} />
              <span className="font-mono text-[10px] font-medium tracking-[2px] uppercase">
                AI-Powered Education Platform
              </span>
            </div>

            {/* H1 */}
            <h1 className="bb-a1 font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-bold mb-6"
                style={{ letterSpacing:"-2px", lineHeight:"1.05", color:"hsl(var(--foreground))" }}>
              The smartest way
              <br />
              to{" "}
              <span className="bb-g italic">learn &amp; teach</span>
            </h1>

            {/* Subheadline */}
            <p className="bb-a2 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light"
               style={{ color:"hsl(var(--muted-foreground))" }}>
              A complete university LMS with AI tutoring, smart quizzes, exam management,
              video learning, and real-time analytics — all in one beautiful platform.
            </p>

            {/* CTAs */}
            <div className="bb-a3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link href="/register"
                    className="bb-btn1 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold">
                Get Started Free <span style={{ opacity:.75 }}>→</span>
              </Link>
              <Link href="/features"
                    className="bb-btn2 inline-flex items-center px-8 py-3.5 rounded-xl text-sm font-medium">
                Explore Features
              </Link>
            </div>

            {/* Stats */}
            <div className="bb-a4 flex items-center justify-center gap-12 mb-16">
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-12">
                  <div className="text-center">
                    <div className="font-serif text-3xl bb-g font-bold">{s.value}</div>
                    <div className="font-mono text-[11px] mt-1 tracking-wider uppercase"
                         style={{ color:"hsl(var(--muted-foreground))" }}>
                      {s.label}
                    </div>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="w-px h-10" style={{ background:"hsl(var(--border))" }} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Dashboard window + floating cards ── */}
            <div className="bb-a5 relative">

              {/* Float A */}
              <div className="bb-fa absolute -left-8 top-12 z-20 hidden lg:block">
                <div className="rounded-xl p-3.5 text-left w-44"
                     style={{ background:"hsl(var(--card))", border:"1px solid hsl(var(--border))",
                              boxShadow:"0 20px 60px hsl(var(--background) / 0.8)" }}>
                  <div className="font-mono text-[10px] mb-1" style={{ color:"hsl(var(--muted-foreground))" }}>
                    AI Sessions Today
                  </div>
                  <div className="font-serif text-2xl font-bold bb-g">1,284</div>
                  <div className="text-[10px] mt-0.5" style={{ color:"hsl(142 70% 45%)" }}>↑ 18% vs yesterday</div>
                </div>
              </div>

              {/* Float B */}
              <div className="bb-fb absolute -right-6 top-8 z-20 hidden lg:block">
                <div className="rounded-xl p-3.5 text-left w-40"
                     style={{ background:"hsl(var(--card))", border:"1px solid hsl(var(--primary) / 0.3)",
                              boxShadow:"0 20px 60px hsl(var(--background) / 0.8)" }}>
                  <div className="font-mono text-[10px] mb-1" style={{ color:"hsl(var(--muted-foreground))" }}>
                    Quiz Accuracy
                  </div>
                  <div className="font-serif text-2xl font-bold bb-g">92.3%</div>
                  <div className="flex gap-0.5 mt-2 items-end" style={{ height:24 }}>
                    {[75,88,72,95,92,98,92].map((v,i) => (
                      <div key={i} className="flex-1 rounded-sm"
                           style={{
                             height:`${(v/100)*24}px`,
                             background: v > 90
                               ? "hsl(var(--primary))"
                               : "hsl(var(--primary) / 0.3)",
                           }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Float C */}
              <div className="bb-fc absolute -right-4 bottom-16 z-20 hidden lg:block">
                <div className="rounded-xl p-3.5 text-left w-44"
                     style={{ background:"hsl(var(--card))", border:"1px solid hsl(var(--primary) / 0.25)",
                              boxShadow:"0 20px 60px hsl(var(--background) / 0.8)" }}>
                  <div className="font-mono text-[10px] mb-2" style={{ color:"hsl(var(--muted-foreground))" }}>
                    Active Students
                  </div>
                  <div className="flex -space-x-2 mb-2">
                    {floatAvatars.map((a, idx) => (
                      <div key={idx}
                           className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-medium text-white"
                           style={{ background:`hsl(${a.hue} 60% 50%)`, outline:"2px solid hsl(var(--card))" }}>
                        {a.initials}
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px]" style={{ color:"hsl(var(--muted-foreground))" }}>
                    <span style={{ color:"hsl(var(--primary))", fontWeight:600 }}>+2,400</span> enrolled
                  </div>
                </div>
              </div>

              {/* Dashboard window */}
              <div className="rounded-2xl overflow-hidden mx-auto max-w-3xl"
                   style={{ background:"hsl(var(--card))", border:"1px solid hsl(var(--border))",
                            boxShadow:"0 48px 140px hsl(var(--background) / 0.9), 0 0 0 1px hsl(var(--primary) / 0.05) inset" }}>

                {/* chrome */}
                <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom:"1px solid hsl(var(--border))" }}>
                  <span className="w-3 h-3 rounded-full bb-dot-r" />
                  <span className="w-3 h-3 rounded-full bb-dot-y" />
                  <span className="w-3 h-3 rounded-full bb-dot-g" />
                  <span className="font-mono ml-4 text-[11px] px-3 py-1 rounded"
                        style={{ background:"hsl(var(--secondary))", border:"1px solid hsl(var(--border))",
                                 color:"hsl(var(--muted-foreground))" }}>
                    brainbox.ai/dashboard
                  </span>
                </div>

                {/* body */}
                <div className="flex" style={{ minHeight:340 }}>
                  {/* sidebar */}
                  <div className="w-48 flex-shrink-0 p-4" style={{ borderRight:"1px solid hsl(var(--border))" }}>
                    <div className="font-mono text-[10px] mb-3 tracking-[1.5px] uppercase"
                         style={{ color:"hsl(var(--muted-foreground))" }}>Navigation</div>
                    {navItems.map((item) => (
                      <div key={item.label}
                           className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-[13px] ${item.active ? "bb-nav-active" : "bb-nav-inactive"}`}>
                        <span style={{ fontSize:13 }}>{item.icon}</span>
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* main pane */}
                  <div className="flex-1 p-5">
                    <div className="font-serif text-base mb-4 font-semibold" style={{ color:"hsl(var(--foreground))" }}>
                      Good morning, Priya 👋
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {metrics.map((m) => (
                        <div key={m.label} className="bb-metric rounded-xl p-3.5">
                          <div className="font-mono text-[10px] mb-1.5" style={{ color:"hsl(var(--muted-foreground))" }}>
                            {m.label}
                          </div>
                          <div className="font-serif text-xl font-bold bb-g">{m.value}</div>
                          <div className="text-[10px] mt-0.5"
                               style={{ color: m.positive ? "hsl(142 70% 45%)" : "hsl(var(--primary))" }}>
                            {m.change}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chart */}
                    <div className="bb-metric rounded-xl p-4">
                      <div className="font-mono text-[10px] mb-3" style={{ color:"hsl(var(--muted-foreground))" }}>
                        Performance over time
                      </div>
                      <svg viewBox="0 0 600 80" className="w-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="bbCF" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="hsl(42 70% 55%)" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="hsl(42 70% 55%)" stopOpacity="0"    />
                          </linearGradient>
                        </defs>
                        <path d="M0,65 C60,60 100,45 160,40 S220,32 280,30 S360,20 420,16 S500,10 600,6"
                              fill="none" stroke="hsl(42 70% 55%)" strokeWidth="2" strokeLinecap="round" />
                        <path d="M0,65 C60,60 100,45 160,40 S220,32 280,30 S360,20 420,16 S500,10 600,6 L600,80 L0,80 Z"
                              fill="url(#bbCF)" />
                        {chartDots.map((d, i) => (
                          <circle key={i} cx={d.cx} cy={d.cy} r="3.5" fill="hsl(42 70% 55%)" opacity="0.85" />
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            TRUSTED BY
        ══════════════════════════════ */}
        <div className="bb-div" />
        <div className="py-5 overflow-hidden" style={{ background:"hsl(var(--card))" }}>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] tracking-[2px] uppercase whitespace-nowrap px-6 flex-shrink-0"
                  style={{ color:"hsl(var(--muted-foreground))" }}>
              Trusted by institutions worldwide
            </span>
            <div className="flex-1 overflow-hidden"
                 style={{ WebkitMaskImage:"linear-gradient(90deg,transparent,black 10%,black 90%,transparent)",
                          maskImage:"linear-gradient(90deg,transparent,black 10%,black 90%,transparent)" }}>
              <div className="bb-mq flex gap-12 whitespace-nowrap w-max">
                {[...trustedBy,...trustedBy].map((name, i) => (
                  <span key={i} className="font-serif text-sm font-medium"
                        style={{ color:"hsl(var(--muted-foreground))" }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bb-div" />

        {/* ══════════════════════════════
            FEATURES
        ══════════════════════════════ */}
        <section className="py-28 relative" style={{ background:"hsl(var(--background))" }}>
          <div className="absolute inset-0 pointer-events-none"
               style={{ background:"radial-gradient(ellipse 60% 40% at 50% 50%, hsl(var(--primary) / 0.04) 0%, transparent 70%)" }} />

          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20 bb-rev">
              <div className="inline-flex items-center gap-2 bb-eye font-mono text-[10px] tracking-[2.5px] uppercase mb-4">
                <span className="inline-block w-5 h-px bb-eye-line" />
                Platform Features
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4"
                  style={{ letterSpacing:"-1.5px", color:"hsl(var(--foreground))" }}>
                Everything you need to{" "}
                <span className="bb-g italic">learn</span>
              </h2>
              <p className="text-base font-light max-w-md mx-auto"
                 style={{ color:"hsl(var(--muted-foreground))" }}>
                Six powerful tools, working in harmony. Built for the modern university.
              </p>
            </div>

            <div className="bb-rev grid sm:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden"
                 style={{ border:"1px solid hsl(var(--border))", gap:"1px",
                          background:"hsl(var(--border))" }}>
              {features.map((f) => (
                <div key={f.title} className={`bb-fc-card p-8 cursor-default`}>
                  <div className="bb-fc-icon w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 relative z-10"
                       style={{ background:"hsl(var(--secondary))", border:"1px solid hsl(var(--border))" }}>
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold mb-2 relative z-10"
                      style={{ color:"hsl(var(--foreground))" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed mb-4 relative z-10"
                     style={{ color:"hsl(var(--muted-foreground))" }}>
                    {f.description}
                  </p>
                  <span className="relative z-10 inline-flex bb-badge font-mono text-[10px] tracking-wide px-2.5 py-1 rounded-full">
                    {f.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            HOW IT WORKS + AI CHAT
        ══════════════════════════════ */}
        <section className="py-28 relative overflow-hidden"
                 style={{ background:"hsl(var(--card))", borderTop:"1px solid hsl(var(--border))", borderBottom:"1px solid hsl(var(--border))" }}>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
               style={{ background:"radial-gradient(ellipse 80% 60% at 100% 50%, hsl(var(--primary) / 0.05) 0%, transparent 70%)" }} />

          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Steps */}
              <div className="bb-rev">
                <div className="inline-flex items-center gap-2 bb-eye font-mono text-[10px] tracking-[2.5px] uppercase mb-5">
                  <span className="inline-block w-5 h-px bb-eye-line" />
                  How It Works
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-5"
                    style={{ letterSpacing:"-1.5px", color:"hsl(var(--foreground))" }}>
                  From signup
                  <br />
                  to <span className="bb-g italic">success</span>
                </h2>
                <p className="text-base font-light mb-10" style={{ color:"hsl(var(--muted-foreground))" }}>
                  Four simple steps to transform how you learn and teach.
                </p>

                {howItWorks.map((item, i) => (
                  <div key={item.step} className="flex gap-5">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="bb-step w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-medium">
                        {item.step}
                      </div>
                      {i < howItWorks.length - 1 && (
                        <div className="w-px my-2"
                             style={{ flex:1, minHeight:24,
                                      background:"linear-gradient(to bottom, hsl(var(--primary) / 0.35), transparent)" }} />
                      )}
                    </div>
                    <div className="pb-8 pt-1.5">
                      <div className="text-sm font-semibold mb-1" style={{ color:"hsl(var(--foreground))" }}>
                        {item.title}
                      </div>
                      <div className="text-sm font-light leading-relaxed" style={{ color:"hsl(var(--muted-foreground))" }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI chat preview */}
              <div className="bb-rev d2">
                <div className="rounded-2xl overflow-hidden"
                     style={{ background:"hsl(var(--background))", border:"1px solid hsl(var(--border))",
                              boxShadow:"0 30px 80px hsl(var(--background) / 0.6)" }}>

                  {/* topbar */}
                  <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom:"1px solid hsl(var(--border))" }}>
                    <div className="w-2 h-2 rounded-full bb-pulse" style={{ background:"hsl(var(--primary))" }} />
                    <span className="text-sm" style={{ color:"hsl(var(--muted-foreground))" }}>AI Tutor — Active</span>
                    <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded bb-badge">GPT-4</span>
                  </div>

                  {/* context bar */}
                  <div className="flex items-center gap-3 px-5 py-2"
                       style={{ background:"hsl(var(--primary) / 0.04)", borderBottom:"1px solid hsl(var(--border))" }}>
                    <span className="font-mono text-[10px]" style={{ color:"hsl(var(--muted-foreground))" }}>Context:</span>
                    {["📖 CS301 — Algorithms","📝 Week 7 Notes"].map((lbl) => (
                      <span key={lbl} className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background:"hsl(var(--secondary))", border:"1px solid hsl(var(--border))",
                                     color:"hsl(var(--muted-foreground))" }}>
                        {lbl}
                      </span>
                    ))}
                  </div>

                  {/* messages */}
                  <div className="p-5 space-y-4">
                    {/* user */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-semibold"
                           style={{ background:"hsl(var(--primary) / 0.15)", color:"hsl(var(--primary))" }}>P</div>
                      <div className="rounded-xl px-4 py-3 text-sm max-w-xs"
                           style={{ background:"hsl(var(--secondary))", border:"1px solid hsl(var(--border))",
                                    color:"hsl(var(--foreground))" }}>
                        Can you explain Big O notation with a real example?
                      </div>
                    </div>
                    {/* AI */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm"
                           style={{ background:"hsl(var(--primary))", color:"hsl(var(--primary-foreground))" }}>🧠</div>
                      <div className="flex-1">
                        <div className="rounded-xl px-4 py-3 text-sm"
                             style={{ background:"hsl(var(--primary) / 0.08)", border:"1px solid hsl(var(--primary) / 0.2)",
                                      color:"hsl(var(--foreground))" }}>
                          <p className="mb-3 leading-relaxed">
                            Of course! Big O describes how an algorithm&apos;s runtime grows as input size <em>n</em> increases.
                          </p>
                          <div className="bb-code rounded-lg p-3 font-mono text-[11px] leading-relaxed">
                            {"// O(n) — Linear"}<br />
                            {"for (let i = 0; i < n; i++) { log(arr[i]) }"}<br /><br />
                            {"// O(1) — Constant"}<br />
                            {"console.log(arr[0]); // always instant"}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* user 2 */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-semibold"
                           style={{ background:"hsl(var(--primary) / 0.15)", color:"hsl(var(--primary))" }}>P</div>
                      <div className="rounded-xl px-4 py-3 text-sm max-w-xs"
                           style={{ background:"hsl(var(--secondary))", border:"1px solid hsl(var(--border))",
                                    color:"hsl(var(--foreground))" }}>
                        What about O(n²)? When does that appear?
                      </div>
                    </div>
                    {/* AI typing */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm"
                           style={{ background:"hsl(var(--primary))", color:"hsl(var(--primary-foreground))" }}>🧠</div>
                      <div className="rounded-xl px-4 py-3"
                           style={{ background:"hsl(var(--primary) / 0.08)", border:"1px solid hsl(var(--primary) / 0.2)" }}>
                        <div className="flex gap-1.5 items-center">
                          {[0,1,2].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bb-td"
                                 style={{ background:"hsl(var(--primary))" }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {promptChips.map((s) => (
                        <span key={s} className="bb-chip font-mono text-[11px] px-3 py-1.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            ANALYTICS SHOWCASE
        ══════════════════════════════ */}
        <section className="py-28 relative overflow-hidden" style={{ background:"hsl(var(--background))" }}>
          <div className="absolute inset-0 pointer-events-none"
               style={{ background:"radial-gradient(ellipse 50% 50% at 20% 50%, hsl(var(--primary) / 0.05) 0%, transparent 70%)" }} />

          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Visuals */}
              <div className="bb-rev order-2 lg:order-1 space-y-3">

                {/* Bar chart card */}
                <div className="rounded-2xl p-6"
                     style={{ background:"hsl(var(--card))", border:"1px solid hsl(var(--border))",
                              boxShadow:"0 16px 50px hsl(var(--background) / 0.5)" }}>
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <div className="text-sm font-semibold" style={{ color:"hsl(var(--foreground))" }}>
                        Weekly Performance
                      </div>
                      <div className="font-mono text-[11px] mt-0.5" style={{ color:"hsl(var(--muted-foreground))" }}>
                        CS301 · Algorithms
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif text-xl font-bold bb-g">87.4%</div>
                      <div className="text-[10px]" style={{ color:"hsl(142 70% 45%)" }}>↑ 3.2%</div>
                    </div>
                  </div>
                  <div className="flex items-end gap-2" style={{ height:80 }}>
                    {barData.map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-sm"
                             style={{ height:`${(v/100)*64}px`,
                                      background: i===5 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)" }} />
                        <span className="font-mono text-[9px]" style={{ color:"hsl(var(--muted-foreground))" }}>
                          {barDays[i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weak topics */}
                <div className="rounded-2xl p-5"
                     style={{ background:"hsl(var(--card))", border:"1px solid hsl(var(--border))" }}>
                  <div className="text-sm font-semibold mb-4" style={{ color:"hsl(var(--foreground))" }}>
                    Topics to Review
                  </div>
                  {weakTopics.map((t) => (
                    <div key={t.name} className="flex items-center gap-3 mb-2.5 last:mb-0">
                      <div className="text-xs w-36 truncate font-light"
                           style={{ color:"hsl(var(--muted-foreground))" }}>{t.name}</div>
                      <div className="flex-1 rounded-full overflow-hidden"
                           style={{ height:4, background:"hsl(var(--border))" }}>
                        <div className="h-full rounded-full"
                             style={{ width:`${t.score}%`,
                                      background: t.hi ? "hsl(142 70% 45%)" : "hsl(var(--primary))" }} />
                      </div>
                      <div className="font-mono text-[11px] w-8 text-right"
                           style={{ color: t.hi ? "hsl(142 70% 45%)" : "hsl(var(--primary))" }}>
                        {t.score}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Score rings */}
                <div className="grid grid-cols-3 gap-3">
                  {scoreRings.map((c) => (
                    <div key={c.label} className="rounded-xl p-4 text-center"
                         style={{ background:"hsl(var(--card))", border:"1px solid hsl(var(--border))" }}>
                      <svg viewBox="0 0 44 44" className="w-11 h-11 mx-auto mb-2">
                        <circle cx="22" cy="22" r="18" fill="none"
                                stroke="hsl(var(--border))" strokeWidth="4" />
                        {c.pct !== null && (
                          <circle cx="22" cy="22" r="18" fill="none"
                                  stroke="hsl(42 70% 55%)" strokeWidth="4" strokeLinecap="round"
                                  strokeDasharray={`${(c.pct/100)*113} 113`}
                                  transform="rotate(-90 22 22)" />
                        )}
                        <text x="22" y="26" textAnchor="middle" fontSize="9"
                              fill="hsl(42 70% 55%)" fontFamily="ui-monospace, monospace" fontWeight="500">
                          {c.text}
                        </text>
                      </svg>
                      <div className="font-mono text-[10px]" style={{ color:"hsl(var(--muted-foreground))" }}>
                        {c.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text */}
              <div className="bb-rev d2 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 bb-eye font-mono text-[10px] tracking-[2.5px] uppercase mb-5">
                  <span className="inline-block w-5 h-px bb-eye-line" />
                  Smart Analytics
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-5"
                    style={{ letterSpacing:"-1.5px", color:"hsl(var(--foreground))" }}>
                  See exactly where
                  <br />
                  to <span className="bb-g italic">improve</span>
                </h2>
                <p className="text-base font-light mb-8 leading-relaxed"
                   style={{ color:"hsl(var(--muted-foreground))" }}>
                  Brainbox AI doesn&apos;t just show you scores — it pinpoints your weak areas,
                  tracks your progress week by week, and tells you exactly where to focus next.
                </p>
                <ul className="space-y-4">
                  {analyticsBullets.map((item) => (
                    <li key={item.text} className="flex items-start gap-3">
                      <span className="text-base mt-0.5">{item.icon}</span>
                      <span className="text-sm font-light leading-relaxed"
                            style={{ color:"hsl(var(--muted-foreground))" }}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            TESTIMONIALS
        ══════════════════════════════ */}
        <section className="py-28"
                 style={{ background:"hsl(var(--card))", borderTop:"1px solid hsl(var(--border))", borderBottom:"1px solid hsl(var(--border))" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 bb-rev">
              <div className="inline-flex items-center gap-2 bb-eye font-mono text-[10px] tracking-[2.5px] uppercase mb-4">
                <span className="inline-block w-5 h-px bb-eye-line" />
                Testimonials
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold"
                  style={{ letterSpacing:"-1.5px", color:"hsl(var(--foreground))" }}>
                Loved by educators &amp;{" "}
                <span className="bb-g italic">students</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5 bb-rev">
              {testimonials.map((t) => (
                <div key={t.name} className="bb-tcard rounded-2xl p-7 relative overflow-hidden">
                  {/* decorative quote */}
                  <div className="absolute font-serif leading-none pointer-events-none select-none"
                       style={{ fontSize:100, top:-12, left:20, color:"hsl(var(--primary) / 0.08)" }}>
                    &ldquo;
                  </div>
                  {/* stars */}
                  <div className="flex gap-1 mb-4">
                    {[0,1,2,3,4].map((i) => (
                      <span key={i} className="text-xs" style={{ color:"hsl(var(--primary))" }}>★</span>
                    ))}
                  </div>
                  <p className="text-sm font-light leading-relaxed mb-6 relative"
                     style={{ color:"hsl(var(--muted-foreground))" }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                         style={{ background:"hsl(var(--primary))", color:"hsl(var(--primary-foreground))" }}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color:"hsl(var(--foreground))" }}>
                        {t.name}
                      </div>
                      <div className="font-mono text-[11px]" style={{ color:"hsl(var(--muted-foreground))" }}>
                        {t.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            CTA
        ══════════════════════════════ */}
        <section className="py-24 px-6" style={{ background:"hsl(var(--background))" }}>
          <div className="max-w-6xl mx-auto">
            <div className="bb-rev relative rounded-3xl overflow-hidden text-center py-20 px-8"
                 style={{ background:"hsl(var(--card))", border:"1px solid hsl(var(--primary) / 0.2)" }}>
              <div className="bb-cg" />
              {/* primary glow */}
              <div className="absolute inset-0 pointer-events-none"
                   style={{ background:"radial-gradient(ellipse 70% 60% at 50% 0%, hsl(var(--primary) / 0.12) 0%, transparent 65%)" }} />

              <div className="relative">
                <div className="inline-flex items-center gap-2 bb-eye font-mono text-[10px] tracking-[2.5px] uppercase mb-6">
                  <span className="inline-block w-5 h-px bb-eye-line" />
                  Start Today — It&apos;s Free
                </div>

                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-5"
                    style={{ letterSpacing:"-2px", color:"hsl(var(--foreground))" }}>
                  Ready to transform
                  <br />
                  your <span className="bb-g italic">learning?</span>
                </h2>

                <p className="text-base font-light max-w-lg mx-auto mb-10"
                   style={{ color:"hsl(var(--muted-foreground))" }}>
                  Join thousands of students and educators using Brainbox AI to make
                  education smarter, faster, and more effective.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/register"
                        className="bb-btn1 inline-flex items-center gap-2 px-9 py-4 rounded-xl text-sm font-semibold">
                    Get Started — It&apos;s Free <span style={{ opacity:.75 }}>→</span>
                  </Link>
                  <Link href="/features"
                        className="bb-btn2 inline-flex items-center px-9 py-4 rounded-xl text-sm font-medium">
                    Schedule a Demo
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-8 mt-10">
                  {trustBadges.map((b) => (
                    <span key={b} className="font-mono text-[11px]"
                          style={{ color:"hsl(var(--muted-foreground))" }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Scroll reveal — safe inline, no React event handlers */}
      <script dangerouslySetInnerHTML={{ __html:`(function(){
        var els=document.querySelectorAll('.bb-rev');
        var io=new IntersectionObserver(function(entries){
          entries.forEach(function(e){if(e.isIntersecting)e.target.classList.add('visible');});
        },{threshold:0.08});
        els.forEach(function(el){io.observe(el);});
      })();` }} />
    </>
  );
}