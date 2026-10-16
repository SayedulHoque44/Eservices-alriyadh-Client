/**
 * Old public Akama directory ( /akama ) – closed.
 * proxy.ts redirects it to the Facebook page; this is a fallback.
 * Single record pages (/akama/{id}) still work.
 */
import { redirect } from "next/navigation";
import { facebookUrl } from "@/lib/site";

export default function AkamaDirectoryPage() {
  redirect(facebookUrl);
}
