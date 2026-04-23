// src/app/manifest.ts — PWA Manifest for Mobile

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Brainbox AI — University LMS",
    short_name: "Brainbox AI",
    description: "AI-powered university learning management system",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0c",
    theme_color: "#c9a84c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}