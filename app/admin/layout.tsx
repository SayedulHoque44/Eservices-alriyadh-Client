/**
 * Layout for everything under /admin (login page + dashboard).
 * Adds the Ant Design theme and React Query (see components/admin/AdminProviders)
 * and keeps admin pages out of search engines.
 */
import type { Metadata } from "next";
import AdminProviders from "@/components/admin/AdminProviders";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
