import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Outfit, Syne } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  weight: "800",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SBH Men's Skincare",
  description:
    "Ingredient-first skincare for men who seek more. Ask the SBH skin guide about routines, ingredients and product picks.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${outfit.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  );
}
