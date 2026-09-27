/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@intentguard/core'],
  serverExternalPackages: ['simple-git']
};

export default nextConfig;
