/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow KaTeX CSS to be imported from node_modules
  transpilePackages: ['react-katex'],
  webpack: (config) => {
    // Enable WebAssembly (not required now but future-proof)
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

module.exports = nextConfig;
