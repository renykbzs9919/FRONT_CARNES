import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true, // Ignorar errores y advertencias de ESLint durante el build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignorar errores de TypeScript durante el build
  },
  swcMinify: true, // Activar la minificación con SWC
};

const pwaConfig = {
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true, // Deshabilitar logs en modo desarrollo
  },
};

// Combinar configuraciones
export default withPWA({
  ...nextConfig,
  ...pwaConfig,
});
