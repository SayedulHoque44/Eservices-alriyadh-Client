/**
 * 404 for any URL that does not exist (e.g. /admin/wrong-page) -> Facebook page.
 * (Unavailable Akama records use app/akama/[id]/not-found.tsx instead.)
 */
import { redirect } from "next/navigation";
import { facebookUrl } from "@/lib/site";

export default function NotFound() {
  redirect(facebookUrl);
}
