import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FinTrack App",
    short_name: "FinTrack",
    description: "Financial tracking made easy",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    // The following properties are standard PWA manifest fields
    // We cast to any to bypass strict Next.js types if needed, 
    // but in newer versions screenshots is actually supported.
    // If you see type errors, you can extend the interface.
    screenshots: [
      {
        src: "/screenshots/mobile-screenshot.png",
        sizes: "1080x1920",
        type: "image/png",
      },
      {
        src: "/screenshots/desktop-screenshot.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  } as MetadataRoute.Manifest;
}
