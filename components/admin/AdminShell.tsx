"use client";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LuExternalLink } from "react-icons/lu";
import BrandMark from "@/components/site/BrandMark";
import { facebookUrl } from "@/lib/site";
import api from "@/lib/api";
import AccountSettingsModal from "./AccountSettingsModal";
import { useMe } from "./useAdmin";

/**
 * Frame of the logged-in admin pages: checks the session, then shows the top
 * bar (logo, "View website", admin email, Account settings, Logout) and the page content.
 */
const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const me = useMe(); // GET /api/auth/me
  const [loggingOut, setLoggingOut] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false); // Account settings pop-up

  // Session missing or expired -> back to the login page
  useEffect(() => {
    if (me.isError) router.replace("/admin/login");
  }, [me.isError, router]);

  // Clears the session cookie on the server, then a full page load to the login page
  const logout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } finally {
      window.location.href = "/admin/login";
    }
  };

  // Nothing is shown until the session is confirmed (spinner meanwhile)
  if (!me.isSuccess) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <BrandMark />
            <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 md:inline">
              Akama Management
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Opens the Facebook page (link set in lib/site.ts) */}
            <Link
              href={facebookUrl}
              target="_blank"
              className="hidden items-center gap-1.5 text-sm text-ink-soft hover:text-brand-600 sm:inline-flex"
            >
              View website <LuExternalLink className="size-3.5" aria-hidden />
            </Link>
            <span className="hidden text-sm text-ink-soft lg:inline">{me.data.email}</span>
            {/* Change login email / PIN */}
            <Button icon={<SettingOutlined />} onClick={() => setSettingsOpen(true)} aria-label="Account settings">
              <span className="hidden sm:inline">Account</span>
            </Button>
            <Button icon={<LogoutOutlined />} onClick={logout} loading={loggingOut}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      {/* Mounted only while open, so the form starts fresh each time */}
      {settingsOpen && (
        <AccountSettingsModal open email={me.data.email} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
};

export default AdminShell;
