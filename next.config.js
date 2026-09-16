/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // MODULE 4: microphone must be allowed for our own origin — the
            // previous `microphone=()` disabled getUserMedia for the whole site,
            // so voice shift logging always reported "microphone blocked"
            // even when the device had granted permission.
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
        ],
      },
    ];
  },

  /**
   * MODULE 4/5: proxy the API through our own origin.
   *
   * The refresh token is an httpOnly cookie set by the backend. When the browser
   * called the backend on its own domain (…onrender.com) that cookie was a
   * third-party cookie, which Safari/Chrome block by default — so /auth/refresh
   * failed and the user was thrown back to /login on every full page load or
   * back-navigation. Proxying /api/* keeps the cookie first-party.
   */
  async rewrites() {
    const target = process.env.API_PROXY_TARGET || 'https://rayvice-backend.onrender.com';
    return [{ source: '/api/:path*', destination: `${target}/api/:path*` }];
  },
};

module.exports = nextConfig;
