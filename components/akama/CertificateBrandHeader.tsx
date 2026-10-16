/**
 * Header of the public certificate page: QR code image (public/images/qr.png),
 * a thin vertical divider and the Arabic business name in large bold green (right-to-left).
 * The name comes from lib/site.ts.
 */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { arabicFont } from "@/lib/fonts";
import { site } from "@/lib/site";

export default function CertificateBrandHeader() {
  return (
    <Link
      href="https://alriyadh.gov.sa/en/new"
      dir="rtl"
      lang="ar"
      aria-label={`${site.name} home`}
      className={`${arabicFont.className} flex items-center gap-4 sm:gap-5`}
    >
      {/* QR code, square (a round crop would cut off its corner markers and stop it scanning) */}
      <img src="/images/demo-logo.png" alt="QR code" width={112} height={112} className="size-24 shrink-0 sm:size-28" />

      {/* Thin grey divider between logo and name */}
      <span className="h-20 w-px shrink-0 bg-gray-300 sm:h-24" aria-hidden />

      {/* Arabic business name */}
      <span className="text-[26px] leading-tight font-extrabold text-[#17834a] sm:text-[34px]">{site.nameAr}</span>
    </Link>
  );
}
