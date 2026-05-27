import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "@uploadthing/react/styles.css";
import "./globals.css";
import Providers from "./providers";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ecodama — Reservas premium para salones de belleza",
  description:
    "El sistema de citas elegante y moderno para salones, spas, estilistas y profesionales de la belleza. Agenda inteligente, pagos anticipados y experiencia premium para tus clientas.",
  keywords: [
    "reservas salón de belleza",
    "agenda spa",
    "citas online estilistas",
    "software peluquería",
    "Ecodama",
  ],
  openGraph: {
    title: "Ecodama — Reservas premium para salones de belleza",
    description:
      "Agenda elegante, pagos anticipados y panel administrativo intuitivo para tu salón.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-mauve-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
