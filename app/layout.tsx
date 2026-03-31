import type { Metadata } from "next";
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TanstackQueryProvider } from "@/providers/tanstack-query";
import { BottomNav } from "@/components/bottom-nav";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "BarberSync",
  description: "Descubra as melhores barbearias e salões do litoral.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${plusJakartaSans.variable} ${merriweather.variable} antialiased`}
      >
        <TanstackQueryProvider>
          {children}
          <BottomNav />
          <Toaster />
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
