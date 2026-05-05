const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  // ✅ moved out of experimental (Next.js 16 fix)
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

module.exports = nextConfig;