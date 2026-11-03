import type { NextConfig } from "next";

// 1단계: 정적 내보내기 (기획안 4장 B안). next build 하면 out/ 폴더가 생긴다.
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
