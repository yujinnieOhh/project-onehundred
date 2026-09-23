import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageView } from "@/components/PostHogPageView";
import "./globals.css";

export const metadata: Metadata = {
  title: "PROJECT ONE HUNDRED",
  description: "100일 동안 하나의 목표를 기록하고 친구와 응원하는 챌린지",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
