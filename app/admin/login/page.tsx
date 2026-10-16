/**
 * Admin login page ( /admin/login ).
 * LoginForm reads ?next= from the URL, so it is wrapped in Suspense (Next.js requirement).
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
