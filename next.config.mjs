import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { webpack, isServer }) => {
    // Alias react-router-dom to our shim
    config.resolve.alias['react-router-dom'] = path.resolve(__dirname, 'src/lib/react-router-dom-shim.tsx');

    // Load VITE_ variables from process.env and inject them
    config.plugins.push(
      new webpack.DefinePlugin({
        'import.meta.env.VITE_apikey': JSON.stringify(process.env.VITE_apikey || ''),
        'import.meta.env.VITE_authDomain': JSON.stringify(process.env.VITE_authDomain || ''),
        'import.meta.env.VITE_databaseURL': JSON.stringify(process.env.VITE_databaseURL || ''),
        'import.meta.env.VITE_projectId': JSON.stringify(process.env.VITE_projectId || ''),
        'import.meta.env.VITE_storageBucket': JSON.stringify(process.env.VITE_storageBucket || ''),
        'import.meta.env.VITE_messagingSenderId': JSON.stringify(process.env.VITE_messagingSenderId || ''),
        'import.meta.env.VITE_appId': JSON.stringify(process.env.VITE_appId || ''),
        'import.meta.env.VITE_measurementId': JSON.stringify(process.env.VITE_measurementId || ''),
      })
    );

    return config;
  },
};

export default nextConfig;
