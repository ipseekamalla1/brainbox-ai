// src/app/(public)/contact/page.tsx — Contact Page

"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <section className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Contact
            </p>
            <h1 className="font-serif text-4xl font-bold mb-4">
              Get in touch
            </h1>
            <p className="text-muted-foreground">
              Have a question or feedback? We&apos;d love to hear from you.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-8 rounded-2xl border border-border bg-card"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  placeholder="you@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
                placeholder="Tell us more..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>

            {status === "success" && (
              <p className="text-sm text-center text-emerald-500 font-medium">
                Message sent successfully! We&apos;ll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-center text-red-500 font-medium">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}