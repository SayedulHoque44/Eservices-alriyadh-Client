/**
 * Business details shown across the public site (name, WhatsApp number, ...).
 * Change them here (or via Client/.env) – every page reads from this file.
 */

// WhatsApp number in international format, digits only (e.g. 966553043862)
const whatsappDigits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966553043862").replace(/\D/g, "");

// Pretty format for display: 966553043862 -> +966 55 304 3862
const formatSaudiNumber = (digits: string) =>
  digits.length === 12 && digits.startsWith("966")
    ? `+966 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
    : `+${digits}`;

// ============================================================================
// FACEBOOK PAGE LINK — paste your page URL here (the ONLY place to change it).
// Every blocked page (home, unknown URLs, old links, "Back to website" buttons)
// sends visitors to this address. NEXT_PUBLIC_FACEBOOK_URL in Client/.env
// overrides it if set. Rebuild / restart the app after changing it.
// ============================================================================
const FACEBOOK_PAGE_URL = "https://alriyadh.gov.sa/en/new";

export const facebookUrl = (process.env.NEXT_PUBLIC_FACEBOOK_URL || FACEBOOK_PAGE_URL).trim();

export const site = {
  name: "Saudi Computer Services",
  // Arabic business name (certificate page header)
  nameAr: "أمانة منطقة الرياض",
  tagline: "Computer & Online Service Partner in Saudi Arabia",
  description:
    "Reliable online application, documentation, and computer services for the Bangladeshi community in Saudi Arabia.",
  // Public site address (page metadata)
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),
  whatsapp: {
    digits: whatsappDigits,
    display: formatSaudiNumber(whatsappDigits),
    // Text pre-filled in the visitor's WhatsApp chat
    defaultMessage: "Hello, I would like to know more about your services.",
  },
};

/** wa.me link that opens WhatsApp (app or web) with a pre-filled message. */
export const whatsappLink = (message: string = site.whatsapp.defaultMessage) =>
  `https://wa.me/${site.whatsapp.digits}?text=${encodeURIComponent(message)}`;

// Largest image the admin can upload; keep equal to MAX_UPLOAD_MB on the server
export const maxUploadMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB) || 4;
