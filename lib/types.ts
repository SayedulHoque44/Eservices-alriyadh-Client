/**
 * Shapes of the data returned by the Express API (see Server/src/app/modules/Akama).
 */

/** Certificate details printed on the card (all plain text, entered by the admin). */
export type AkamaDetails = {
  name: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  identityNumber: string;
  gender: string;
  nationality: string;
  profession: string;
  trainingProgram: string;
  programCompletionDate: string;
  organizationName: string;
  organizationLicenseNumber: string;
};

/** A record as visitors see it (GET /api/public/akama). */
export type PublicAkama = AkamaDetails & {
  id: string; // permanent Akama record ID
  imageUrl: string; // relative /api/... URL, goes through the proxy
};

/** A record as the admin sees it (GET /api/admin/akama). */
export type AdminAkama = PublicAkama & {
  /** Permanent public URL (also what the QR code contains) */
  publicUrl: string;
  isPublic: boolean;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};

/** Paging info that comes with every list. */
export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** A page of list results. */
export type Paginated<T> = { items: T[]; meta: PageMeta };

/** Dashboard counters (GET /api/admin/akama/stats). */
export type AkamaStats = { total: number; public: number; private: number };

/** Envelope around every API response: { success, message, data }. */
export type ApiResponse<T> = { success: boolean; message?: string; data: T };
