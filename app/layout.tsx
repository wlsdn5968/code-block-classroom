import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "코드 블록 교실",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <head>
        {/* 프로토타입과 같은 글꼴. 빌드 중 외부 다운로드가 없도록 next/font 대신 링크로 불러온다 */}
        {/* 글꼴 목록(googleapis)과 글꼴 파일(gstatic)은 주소가 달라 둘 다 미리 연결한다. 글꼴 파일은 crossorigin으로 받는다 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Sans KR 500은 어느 화면에서도 쓰지 않아(2026-11-09 전 화면 실측) 뺐다. 목록 파일이 압축 기준 약 53KB → 40KB로 준다 */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=IBM+Plex+Sans+KR:wght@400;700&family=IBM+Plex+Mono:wght@500&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
