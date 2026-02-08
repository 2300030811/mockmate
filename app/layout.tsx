import "../styles/globals.css";
import { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Mockmate - AI-Powered Mock Interviews",
  openGraph: {
    title: "Mockmate - AI-Powered Mock Interviews",
    description:
      "Mockmate is an AI-powered mock interview platform that helps you practice for your next job interview.",
    images: [
      {
        url: `${baseUrl}/opengraph-image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mockmate - AI-Powered Mock Interviews",
    description:
      "Mockmate is an AI-powered mock interview platform that helps you practice for your next job interview.",
    images: [`${baseUrl}/opengraph-image`],
  },
  metadataBase: new URL(baseUrl),
};

export const viewport = {
  themeColor: "#FFF",
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} ${outfit.variable} font-sans scroll-smooth antialiased [font-feature-settings:'ss01'] bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
