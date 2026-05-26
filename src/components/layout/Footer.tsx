// src/components/layout/Footer.tsx

import Link from "next/link";

const footerLinks = {
  Platform: [
    { label: "Features", href: "/features" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "AI Tutor", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-background overflow-hidden">

      {/* background glow layer */}
      <div className="absolute inset-0 opacity-60 pointer-events-none bg-gradient-to-b from-transparent via-primary/5 to-background" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 relative z-10">

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">

          {/* BRAND */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-lg">
                B
              </div>

              <span className="font-serif font-bold text-2xl tracking-tight">
                Brainbox<span className="text-primary">AI</span>
              </span>
            </div>

            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              A modern AI-powered learning platform built to help students study smarter,
              track progress, and achieve better results with intelligent tools.
            </p>
          </div>

          {/* LINKS */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
                {heading}
              </h4>

              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* DIVIDER */}
        <div className="border-t border-border pt-10 flex flex-col md:flex-row justify-between items-center gap-6">

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Brainbox AI. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="hover:text-primary cursor-pointer transition">Status</span>
            <span className="hover:text-primary cursor-pointer transition">Security</span>
            <span className="hover:text-primary cursor-pointer transition">Support</span>
          </div>

        </div>

      </div>
    </footer>
  );
}