/**
 * Layout for the logged-in admin pages. "(panel)" is a route group: it does not
 * appear in the URL, so this applies to /admin but not to /admin/login.
 * AdminShell checks the session and draws the top bar with Logout.
 */
import AdminShell from "@/components/admin/AdminShell";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
