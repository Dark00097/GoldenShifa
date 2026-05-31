const apiImagePattern = (() => {
  try {
    const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || '');
    return {
      protocol: apiUrl.protocol.replace(':', ''),
      hostname: apiUrl.hostname,
      port: apiUrl.port,
      pathname: '/uploads/**'
    };
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/connexion', destination: '/', permanent: false },
      { source: '/inscription', destination: '/', permanent: false },
      { source: '/mon-compte', destination: '/', permanent: false },
      { source: '/mes-commandes', destination: '/', permanent: false }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4000', pathname: '/uploads/**' },
      ...(apiImagePattern ? [apiImagePattern] : [])
    ]
  }
};

export default nextConfig;
