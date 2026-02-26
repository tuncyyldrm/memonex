/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'query',
            key: 'm',
            value: '1',
          },
        ],
        permanent: true,
        destination: '/', // Parametresiz ana sayfaya atar
      },
    ];
  },
};

export default nextConfig;