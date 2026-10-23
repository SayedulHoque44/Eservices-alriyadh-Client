/**
 * Shapes of the data returned by the Express API
 * (see Server/src/app/modules/Akama and Server/src/app/modules/Absher).
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

/** Absher account details – all plain text typed by the admin (see lib/absherFields.ts). */
export type AbsherDetails = {
  // Account (app login)
  name: string;
  residentId: string; // Resident ID number = app login ID
  pin: string; // app login PIN
  // Personal Details
  nationality: string;
  birthCity: string;
  birthCountry: string;
  dateOfBirth: string;
  maritalStatus: string;
  sponsorshipTransfers: string;
  religion: string;
  workPermit: string;
  biometricsCollected: string;
  travelStatus: string;
  // Sponsor Details
  sponsorName: string;
  sponsorId: string;
  // Health Insurance
  insuranceIssueDate: string;
  insuranceExpiryDate: string;
  bloodType: string;
  // Passport
  amountDeposit: string;
  passportNumber: string;
  passportType: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  passportIssueCity: string;
  passportStatus: string;
  // Resident ID card
  idVersion: string;
  idIssueDate: string;
  idExpiryDate: string;
};

/** An Absher account as the admin sees it (GET /api/admin/absher). */
export type AdminAbsher = AbsherDetails & {
  id: string; // database ID (not the resident ID)
  photoKey: string; // full S3 key "<folder>/<file>" – shown via cdnImageUrl()
  cardKey: string; // "" when no Absher card image was uploaded
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};

/** Absher dashboard counter (GET /api/admin/absher/stats). */
export type AbsherStats = { total: number };

/** Envelope around every API response: { success, message, data }. */
export type ApiResponse<T> = { success: boolean; message?: string; data: T };
