import type { MetadataRoute } from "next";
import { withBasePath } from "@/lib/paths";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calcolatore Costi PHEV",
    short_name: "Costi PHEV",
    description: "Confronto dei costi di viaggio di un'ibrida plug-in.",
    lang: "it",
    start_url: withBasePath("/"),
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#1f6feb",
    icons: [
      { src: withBasePath("/icon.svg"), sizes: "any", type: "image/svg+xml" },
      { src: withBasePath("/icon-192.png"), sizes: "192x192", type: "image/png" },
      { src: withBasePath("/icon-512.png"), sizes: "512x512", type: "image/png" },
    ],
  };
}
