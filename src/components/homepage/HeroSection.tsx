"use client";

import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import HeroSection from "@/components/homepage/HeroSection";
import TrustedBy from "@/components/homepage/Trustedby";
import MissionSection from "@/components/homepage/MissionSection";
import FeaturesSection from "@/components/homepage/FeatureSection";
import AnalyticsSection from "@/components/homepage/AnalyticsSection";
import HowItWorksSection from "@/components/homepage/HowItWorksSection";
import Testimonials from "@/components/homepage/Testimonials";
import StatsTrustSection from "@/components/homepage/StatsTrustSection";
import CTASection from "@/components/homepage/CTASection";

export default function HomePage() {
  useEffect(() => {
    // Scroll reveal animation
    const els = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.07 }
    );

    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />

      <main className="site-bg">
        {/* HERO (separate component) */}
        <HeroSection />

        {/* PAGE SECTIONS */}
        <TrustedBy />
        <MissionSection />
        <FeaturesSection />
        <AnalyticsSection />
        <HowItWorksSection />
        <Testimonials />
        <StatsTrustSection />
        <CTASection />
      </main>

      <Footer />
    </>
  );
}