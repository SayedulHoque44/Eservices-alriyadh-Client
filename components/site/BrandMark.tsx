import Link from "next/link";
import { LuMonitor } from "react-icons/lu";
import { facebookUrl, site } from "@/lib/site";

/**
 * Logo + business name, linking to the Facebook page (lib/site.ts).
 * Used in the admin top bar and login page.
 * `light` switches the text to white for use on dark backgrounds.
 */
const BrandMark = ({ light = false }: { light?: boolean }) => (
  <Link href={facebookUrl} className="group flex items-center gap-2.5" aria-label={`${site.name} home`}>
    {/* Icon: green tile with a monitor and a small lime dot */}
    <span className="relative grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
      <LuMonitor className="size-5" aria-hidden />
      <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-accent-400" />
    </span>
    <span className="leading-tight">
      <span className={`block text-[15px] font-semibold ${light ? "text-white" : "text-ink"}`}>
        Saudi Computer Services
      </span>
      <span className={`block text-[11px] tracking-wide ${light ? "text-brand-100" : "text-ink-soft"}`}>
        Riyadh · Kingdom of Saudi Arabia
      </span>
    </span>
  </Link>
);

export default BrandMark;
