/**
 * Health certificate card (Arabic, right-to-left).
 *
 * Copies the layout of the official certificate card: three sections
 * (certificate details, certificate holder, organization), each with a green
 * heading and rows of "grey label on the right / dark value on the left".
 * Labels and their order come from lib/akamaFields.ts; values come from the record.
 */
import { akamaSections } from "@/lib/akamaFields";
import { arabicFont } from "@/lib/fonts";
import type { AkamaDetails } from "@/lib/types";

// className: extra classes from the caller (e.g. hover styles in the public grid)
type Props = { record: AkamaDetails; className?: string };

export default function HealthCertificateCard({ record, className = "" }: Props) {
  return (
    <div
      dir="rtl"
      lang="ar"
      className={`${arabicFont.className} w-full max-w-sm rounded-lg border border-[#e6e6e6] bg-white px-4 py-4 shadow-[0_1px_6px_rgba(0,0,0,0.14)] ${className}`}
    >
      {akamaSections.map((section, i) => (
        // Sections after the first get a thin divider line above them
        <section key={section.title} className={i > 0 ? "mt-4 border-t border-[#dcdcdc] pt-4" : ""}>
          {/* Green bold heading, slightly larger than the rows */}
          <h2 className="mb-4 text-[16px] leading-6 font-extrabold text-[#17834a]">{section.title}</h2>

          <dl className="space-y-[22px] pb-2">
            {section.fields.map(field => (
              // Label column has a fixed width so all values line up (label on the right in RTL)
              <div key={field.key} className="flex items-baseline gap-4">
                {/* Labels: small, light grey, regular weight */}
                <dt className="w-[110px] shrink-0 text-[13px] leading-5 font-normal text-[#9e9e9e]">{field.label}</dt>
                {/* Values: near-black; text values extra-bold, numbers/dates bold */}
                <dd
                  className={`text-[14.5px] leading-5 text-[#111] ${field.strong ? "font-extrabold" : "font-bold"}`}
                >
                  {/* Numbers/dates keep left-to-right digit order inside the RTL card */}
                  <bdi>{record[field.key]}</bdi>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
