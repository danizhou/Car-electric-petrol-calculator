import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { withBasePath } from "@/lib/paths";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calcolatore Costi PHEV",
  description: "Confronto dei costi di viaggio di un'ibrida plug-in: batteria carica contro batteria scarica.",
  applicationName: "Costi PHEV",
  icons: {
    icon: withBasePath("/icon.svg"),
    apple: withBasePath("/apple-icon.png"),
  },
  appleWebApp: {
    capable: true,
    title: "Costi PHEV",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#12151b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
