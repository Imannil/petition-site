import type { Metadata } from "next";
import { Source_Serif_4, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Stop Iran War — Peace Petition",
  description:
    "A petition calling for de-escalation, dialogue, and peace. Add your name in support.",
  openGraph: {
    title: "Stop Iran War — Peace Petition",
    description: "Sign the petition. Stand for peace.",
    url: "https://stopiranwar.org",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${cormorant.variable} ${dmSans.variable}`}>
      <body className="relative z-[1] antialiased">{children}</body>
    </html>
  );
}
