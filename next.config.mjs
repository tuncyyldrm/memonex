/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        // Tüm alt sayfalarda (?m=1) gelirse yakala
        source: '/:path*', 
        has: [
          {
            type: 'query',
            key: 'm',
            value: '1',
          },
        ],
        permanent: true,
        destination: '/:path*', // Parametreyi otomatik olarak kırpar
      },
    ];
  },
};

export default nextConfig;