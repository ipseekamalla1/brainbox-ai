// src/components/layout/Footer.tsx — Public Site Footer

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
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                B
              </div>
              <span className="font-serif font-bold text-base">
                Brainbox<span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered university learning, reimagined.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {heading}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Brainbox AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, Prisma & OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
}