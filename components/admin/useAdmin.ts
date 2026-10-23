"use client";
/**
 * React Query hooks for every admin API call.
 *
 * Queries (read):   useMe, useAkamaStats, useAkamaList, useAbsherStats, useAbsherList
 * Mutations (write): useSaveAkama, useSetVisibility, useDeleteAkama, useSaveAbsher, useDeleteAbsher
 *
 * After any successful change, all "akama" (or "absher") queries are refreshed so
 * the table and the counters always show the latest data.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  AbsherDetails,
  AbsherStats,
  AdminAbsher,
  AdminAkama,
  AkamaDetails,
  AkamaStats,
  ApiResponse,
  Paginated,
} from "@/lib/types";

/** Table filters (sent as query parameters to GET /api/admin/akama). */
export type AkamaFilters = {
  search: string;
  visibility: "all" | "public" | "private";
  from?: string; // ISO date-time
  to?: string; // ISO date-time
  sort: "newest" | "oldest";
  page: number;
  limit: number;
};

// Unwraps the API envelope { success, message, data } -> data
const data = <T,>(promise: Promise<{ data: ApiResponse<T> }>) => promise.then(res => res.data.data);

/** Logged-in admin (401 -> error, used to decide between login page and dashboard). */
export const useMe = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: () => data<{ email: string }>(api.get("/auth/me")),
    retry: false, // a 401 is an answer, not a network glitch
  });

/**
 * Change the admin's email and/or PIN (current PIN required).
 * The server sends a fresh session cookie, so this browser stays logged in;
 * the new email is written straight into the "me" query for the top bar.
 */
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { currentPassword: string; email?: string; newPassword?: string }) =>
      data<{ email: string }>(api.patch("/auth/account", body)),
    onSuccess: result => queryClient.setQueryData(["me"], result),
  });
};

/** Dashboard counters. */
export const useAkamaStats = () =>
  useQuery({
    queryKey: ["akama", "stats"],
    queryFn: () => data<AkamaStats>(api.get("/admin/akama/stats")),
  });

/** One page of the records table. Re-fetches automatically when the filters change. */
export const useAkamaList = (filters: AkamaFilters) =>
  useQuery({
    queryKey: ["akama", "list", filters],
    queryFn: () => {
      // Only send the optional filters that are actually set
      const params: Record<string, string | number> = {
        visibility: filters.visibility,
        sort: filters.sort,
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      return data<Paginated<AdminAkama>>(api.get("/admin/akama", { params }));
    },
    keepPreviousData: true, // keep showing the current rows while the next page loads
  });

// Any change refreshes both the table and the counts
const useAkamaMutation = <TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["akama"] }),
  });
};

/**
 * Create (no id) or edit (with id). Also used to attach the uploaded image
 * ({ imageKey, isPublic }) once the record exists – see AkamaFormModal.
 */
export const useSaveAkama = () =>
  useAkamaMutation(
    ({ id, body }: { id?: string; body: Partial<AkamaDetails> & { isPublic?: boolean; imageKey?: string } }) =>
      data<AdminAkama>(id ? api.patch(`/admin/akama/${id}`, body) : api.post("/admin/akama", body)),
  );

/** Make Public / Make Private. */
export const useSetVisibility = () =>
  useAkamaMutation(({ id, isPublic }: { id: string; isPublic: boolean }) =>
    data<AdminAkama>(api.patch(`/admin/akama/${id}/visibility`, { isPublic })),
  );

/** Delete a record (and its image, on the server). */
export const useDeleteAkama = () =>
  useAkamaMutation((id: string) => data<{ id: string }>(api.delete(`/admin/akama/${id}`)));

// ================= Absher =================

/** Absher table filters (sent as query parameters to GET /api/admin/absher). */
export type AbsherFilters = Omit<AkamaFilters, "visibility">;

/** Absher counter. */
export const useAbsherStats = () =>
  useQuery({
    queryKey: ["absher", "stats"],
    queryFn: () => data<AbsherStats>(api.get("/admin/absher/stats")),
  });

/** One page of the Absher table. Re-fetches automatically when the filters change. */
export const useAbsherList = (filters: AbsherFilters) =>
  useQuery({
    queryKey: ["absher", "list", filters],
    queryFn: () => {
      // Only send the optional filters that are actually set
      const params: Record<string, string | number> = { sort: filters.sort, page: filters.page, limit: filters.limit };
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      return data<Paginated<AdminAbsher>>(api.get("/admin/absher", { params }));
    },
    keepPreviousData: true, // keep showing the current rows while the next page loads
  });

// Any Absher change refreshes both the table and the count
const useAbsherMutation = <TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["absher"] }),
  });
};

/**
 * Create (no id) or edit (with id). Also used to attach an uploaded image
 * ({ photoKey } or { cardKey }) once the account exists – see AbsherFormModal.
 */
export const useSaveAbsher = () =>
  useAbsherMutation(
    ({ id, body }: { id?: string; body: Partial<AbsherDetails> & { photoKey?: string; cardKey?: string } }) =>
      data<AdminAbsher>(id ? api.patch(`/admin/absher/${id}`, body) : api.post("/admin/absher", body)),
  );

/** Delete an Absher account (and its images, on the server). */
export const useDeleteAbsher = () =>
  useAbsherMutation((id: string) => data<{ id: string }>(api.delete(`/admin/absher/${id}`)));
