/**
 * Public record page ( /akama/{id} ) – the page opened by shared links and QR codes.
 *
 * Shows the Saudi Computer Services logo, the person's photo, the "شهادة صحية" (Health Certificate) title and the
 * Arabic certificate card on a white page (no site header or footer), plus a
 * note that this is the business's own copy, not an official government document.
 * Private, deleted or unknown records show app/akama/[id]/not-found.tsx instead.
 */
/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HealthCertificateCard from "@/components/akama/HealthCertificateCard";
import CertificateBrandHeader from "@/components/akama/CertificateBrandHeader";
import DownloadPdfButton from "@/components/akama/DownloadPdfButton";
import { arabicFont } from "@/lib/fonts";
import { getPublicAkama, isAdminLoggedIn } from "@/lib/serverApi";
import { site } from "@/lib/site";

// Always check visibility on request; never serve a cached copy
export const dynamic = "force-dynamic";

// Generic title (the person's name is not shown) and kept out of search engines
export const metadata: Metadata = {
  title: "Akama",
  robots: { index: false, follow: false },
};

// Next.js 16 passes route params as a Promise
type Props = { params: Promise<{ id: string }> };

// Opened from shared links and QR codes: logo, photo, title, certificate card and note on white.
export default async function AkamaRecordPage({ params }: Props) {
  const { id } = await params;
  // Server-side check against the API: null unless the record is public
  const record = await getPublicAkama(id);
  if (!record) notFound();
  // Only logged-in admins get the "Download PDF" button
  const isAdmin = await isAdminLoggedIn();

  return (
    <main className="flex min-h-dvh flex-col items-center bg-white px-4 py-8 sm:py-10">
      {/* Everything inside this box is what goes into the downloaded PDF */}
      <div
        id="akama-certificate"
        className="flex w-full max-w-md flex-col items-center bg-white px-2 py-4"
      >
        {/* Business logo + Arabic name (links to the homepage) */}
        <div className="mb-6">
          <CertificateBrandHeader />
        </div>

        {/* Passport-style photo. Loaded through /api/public/akama/{id}/image, which re-checks visibility */}
        <img
          src={record.imageUrl}
          alt={record.name}
          width={165}
          height={185}
          className="h-[185px] w-[165px] object-cover"
        />

        {/* "Health Certificate" title in large bold green Arabic */}
        <h1
          dir="rtl"
          lang="ar"
          className={`${arabicFont.className} mt-4 mb-12 text-[38px] leading-tight font-extrabold text-[#17834a]`}
        >
          شهادة صحية
        </h1>

        <HealthCertificateCard record={record} />
      </div>

      {/* Saves the box above as a PDF (kept outside it, so the button isn't in the PDF).
          Admins only – public visitors never receive the button. */}
      {isAdmin && (
        <DownloadPdfButton
          targetId="akama-certificate"
          fileName={`health-certificate-${id}.pdf`}
        />
      )}

      {/* Makes clear who keeps this record: Arabic, then English */}
    </main>
  );
}
