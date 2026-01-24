import "../styles/globals.css";
import { Metadata } from "next";

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
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scroll-smooth antialiased [font-feature-settings:'ss01']">
        {children}
      </body>
    </html>
  );
}
