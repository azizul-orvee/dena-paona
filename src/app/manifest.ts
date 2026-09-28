import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dena-Paona — dues & receivables",
    short_name: "Dena-Paona",
    description:
      "A calm, private ledger for money between friends and family.",
    start_url: "/app",
    display: "standalone",
    background_color: "#05060a",
    theme_color: "#05060a",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
