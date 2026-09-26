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
        source: "/practice/tornado-home-1",
        destination: "/practice/tornado",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
