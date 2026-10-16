"use client";
import { Alert, Button, Form, Input } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import BrandMark from "@/components/site/BrandMark";
import api, { getErrorMessage } from "@/lib/api";
import { facebookUrl } from "@/lib/site";
import { useMe } from "./useAdmin";

type Values = { email: string; password: string };

/**
 * Admin login form (on /admin/login).
 * POST /api/auth/login sets the session cookie; then we go to the dashboard
 * (or the admin page the user originally asked for, from ?next=).
 */
const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const me = useMe();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Only allow redirects back into the admin area
  const next = searchParams.get("next");
  const target = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";

  // Already logged in? Skip the form.
  useEffect(() => {
    if (me.isSuccess) router.replace(target);
  }, [me.isSuccess, router, target]);

  // Submit: on failure show the server's message (wrong password, too many attempts, ...)
  const onFinish = async (values: Values) => {
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/login", values);
      router.replace(target);
    } catch (err) {
      setError(getErrorMessage(err, "Could not log in. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center">
        <BrandMark />
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-semibold text-ink">Admin Login</h1>
        <p className="mt-1 text-sm text-ink-soft">Log in to manage Akama records.</p>

        {error && <Alert className="!mt-5" type="error" showIcon title={error} />}

        <Form<Values> layout="vertical" requiredMark={false} className="!mt-5" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input size="large" autoComplete="username" inputMode="email" autoFocus />
          </Form.Item>
          <Form.Item label="PIN" name="password" rules={[{ required: true, message: "Please enter your PIN" }]}>
            <Input.Password size="large" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
            Log in
          </Button>
        </Form>
      </div>

      <Link href={facebookUrl} className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-soft hover:text-brand-600">
        <LuArrowLeft className="size-4" aria-hidden />
        Back to website
      </Link>
    </div>
  );
};

export default LoginForm;
