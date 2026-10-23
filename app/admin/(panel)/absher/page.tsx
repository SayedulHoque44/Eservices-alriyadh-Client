/**
 * Absher admin page ( /admin/absher ): count, filters, accounts table, add/edit/view.
 * All logic is in components/admin/AbsherDashboard.tsx.
 */
import type { Metadata } from "next";
import AbsherDashboard from "@/components/admin/AbsherDashboard";

export const metadata: Metadata = {
  title: "Absher Management",
};

export default function AdminAbsherPage() {
  return <AbsherDashboard />;
}
