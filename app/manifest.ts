import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calcolatore Costi PHEV",
    short_name: "Costi PHEV",
    description: "Confronto dei costi di viaggio di un'ibrida plug-in.",
    lang: "it",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#1f6feb",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
