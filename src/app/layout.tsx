
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { LanguageProvider } from "@/components/LanguageProvider";
import "@/lib/error-handlers"; // Global error handling

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farm IoT Dashboard",
  description: "A dashboard for monitoring IoT farm devices and stock.",
  openGraph: {
    title: "Farm IoT Dashboard",
    description: "A dashboard for monitoring IoT farm devices and managing animal feed and medical stock.",
    url: "https://your-domain.com/", // <-- update to your real domain
    siteName: "Farm IoT Dashboard",
    images: [
      {
        url: "/og-farmlab.png", // <-- place your custom image in public/og-farmlab.png
        width: 1200,
        height: 630,
        alt: "Farm IoT Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Farm IoT Dashboard",
    description: "A dashboard for monitoring IoT farm devices and managing animal feed and medical stock.",
    images: ["/og-farmlab.png"],
    site: "@yourtwitter", // <-- update to your Twitter handle if you have one
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
