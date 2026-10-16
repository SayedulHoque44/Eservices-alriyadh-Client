/**
 * Home page ( / ) – intentionally empty.
 * proxy.ts already redirects "/" to the Facebook page; this is a fallback
 * in case the proxy is ever skipped.
 */
import { redirect } from "next/navigation";
import { facebookUrl } from "@/lib/site";

export default function HomePage() {
  redirect(facebookUrl);
}
