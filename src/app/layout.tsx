import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PickAIHub - Find the Best AI Tools for Any Task",
  description:
    "Discover thousands of AI tools, categorized for your needs. Boost productivity with the latest AI technology.",
  keywords: "AI工具, AI导航, 人工智能, ChatGPT, Midjourney, AI工具推荐, AI工具大全",
};

// ... imports
import Providers from "@/components/Providers";
import FavoritesProvider from "@/components/FavoritesProvider";
import { getUserFavoriteIds } from "@/lib/queries";

import { GoogleAnalytics } from '@next/third-parties/google';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialFavorites = await getUserFavoriteIds();

  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <FavoritesProvider initialFavorites={initialFavorites}>
            {children}
          </FavoritesProvider>
        </Providers>
        <GoogleAnalytics gaId="G-RQVPERT200" />
      </body>
    </html>
  );
}
