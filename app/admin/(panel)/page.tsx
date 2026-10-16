/**
 * Admin dashboard ( /admin ): counts, filters, records table, add/edit/view/QR.
 * All logic is in components/admin/AkamaDashboard.tsx.
 */
import type { Metadata } from "next";
import AkamaDashboard from "@/components/admin/AkamaDashboard";

export const metadata: Metadata = {
  title: "Akama Management",
};

export default function AdminDashboardPage() {
  return <AkamaDashboard />;
}
