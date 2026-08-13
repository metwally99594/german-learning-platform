import type { NextConfig } from "next";

// Next.js App Router streams RSC hydration data via inline <script> tags
// (self.__next_f.push(...)), so script-src needs 'unsafe-inline' here --
// this file's static headers() can't generate a per-request nonce (that
// needs middleware), which is the stronger alternative if this is ever
// revisited. style-src needs 'unsafe-inline' too: Base UI's popover/
// dropdown/tooltip positioning sets inline styles via JS.
//
// 'unsafe-eval' is added ONLY in development: webpack's dev-mode module
// system (next dev) wraps modules in eval()-based code for HMR, and without
// this, that eval() call is blocked by the CSP -- which doesn't just log a
// console warning, it silently breaks React hydration entirely (confirmed:
// hydrated elements never get their __reactProps, so no client component
// anywhere on the page ever becomes interactive -- clicks, effects, state,
// all inert). Production's webpack build doesn't use eval() for anything,
// so this is dev-only and doesn't weaken the deployed CSP.
const scriptSrc = ["'self'", "'unsafe-inline'", ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : [])].join(
  " "
);

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  // Speaking-practice playback plays back the learner's own recording via
  // a blob: URL (URL.createObjectURL on the recorded MediaRecorder blob).
  "media-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // camera/geolocation are never used by this app, so fully denied.
          // microphone must stay allowed for same-origin (self) -- the
          // mündlich speaking-practice recorder calls
          // navigator.mediaDevices.getUserMedia({ audio: true }), and
          // microphone=() would silently break that feature.
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
