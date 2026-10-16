"use client";
/**
 * HTTP client for browser code (admin panel).
 *
 * Same-origin: next.config.ts proxies /api/* to the Express server,
 * and the admin session travels in an HTTP-only cookie (sent automatically).
 */
import axios, { AxiosError } from "axios";

// Every call is relative to /api, e.g. api.get("/admin/akama") -> /api/admin/akama
export const api = axios.create({ baseURL: "/api" });

// If the session expired while using the admin panel, go back to the login
// page (and come back to the same page after logging in).
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const onAdminPage =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin") &&
      !window.location.pathname.startsWith("/admin/login");
    if (error.response?.status === 401 && onAdminPage) {
      window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    return Promise.reject(error);
  },
);

/** Turns any request error into a plain-language message for the admin. */
export const getErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again.") => {
  if (axios.isAxiosError(error)) {
    // No response at all = network problem
    if (!error.response) return "Cannot reach the server. Check your internet connection.";
    // Otherwise use the server's own message (e.g. "Name is required")
    const message = (error.response.data as { message?: string })?.message;
    if (message) return message;
  }
  return fallback;
};

export default api;
