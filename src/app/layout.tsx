import type { Metadata } from "next";
import { Almarai, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { NavigationBar } from "@/components/navigation-bar";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { Toaster } from "@/components/ui/sonner";
import { getUser } from "@/lib/services/auth.service";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GoViral — AI Content Virality Analyzer",
  description:
    "Upload your content and get an AI virality score with actionable feedback to maximize reach on TikTok, Instagram, and YouTube Shorts.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <html lang="en" className={`${almarai.variable} ${instrumentSerif.variable}`}>
      <body className="bg-black text-primary min-h-screen antialiased">
        <NavigationBar user={user} />
        <SmoothScrollProvider>
          <main>{children}</main>
        </SmoothScrollProvider>
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#101010",
              border: "1px solid rgba(222,219,200,0.1)",
              color: "#E1E0CC",
            },
          }}
        />
      </body>
    </html>
  );
}
