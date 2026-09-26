import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/practice/hurricane-flood-1",
        destination: "/practice/hurricane",
        permanent: false,
      },
      {
        source: "/practice/home-fire-1",
        destination: "/practice/home-fire",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
