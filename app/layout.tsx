/**
 * Root layout – wraps every page of the site (public pages and admin panel).
 * Sets the fonts, global CSS and default page title/description.
 */
import type { Metadata, Viewport } from "next";
import { Lexend, Noto_Sans_Bengali } from "next/font/google";
import "@/styles/globals.css";
import { site } from "@/lib/site";

// Fonts are downloaded at build time and served from this site (no Google request
// from the visitor). Lexend for English, Noto Sans Bengali for Bengali text.
const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali"],
  display: "swap",
});

// Default <title>/<meta> tags. Pages can override them; "%s" is the page's own title.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    siteName: site.name,
    type: "website",
  },
  // <meta name="google" content="notranslate"> – tells Google Chrome / Google
  // Search not to offer translating the page, so the Arabic text stays as written.
  other: {
    google: "notranslate",
  },
};

// Colours the mobile browser bar in the brand green
export const viewport: Viewport = {
  themeColor: "#006c35",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // translate="no" + the "notranslate" class stop browser translators (Chrome,
    // Edge, Google Translate) from translating or offering to translate the page.
    <html lang="en" translate="no" className="notranslate">
      <body className={`${lexend.variable} ${notoSansBengali.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
