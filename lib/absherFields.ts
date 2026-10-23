/**
 * Absher account fields, grouped and ordered like the sections in the mobile app.
 *
 * Used by the admin form (components/admin/AbsherFormModal.tsx) and the details
 * pop-up (AbsherViewModal.tsx). Max lengths match absher.validation.ts on the server.
 */
import type { AbsherDetails } from "./types";

export type AbsherField = {
  key: keyof AbsherDetails;
  label: string; // English label, same as in the app
  max: number; // max length (matches the server)
  required?: boolean; // only name, resident ID and PIN are required
  placeholder?: string;
  initial?: string; // pre-filled value for a new account
  options?: string[]; // suggestions (free text is still allowed)
};

export type AbsherFieldSection = { title: string; fields: AbsherField[] };

// Date fields are free text, typed like the app shows them
const DATE = "DD/MM/YYYY";

export const absherSections: AbsherFieldSection[] = [
  {
    title: "App Login",
    fields: [
      { key: "name", label: "Name", max: 120, required: true },
      { key: "residentId", label: "Resident ID Number (login ID)", max: 20, required: true, placeholder: "e.g. 2628444925" },
      { key: "pin", label: "PIN", max: 20, required: true, placeholder: "4–20 characters (any)" },
    ],
  },
  {
    title: "Personal Details",
    fields: [
      { key: "nationality", label: "Nationality", max: 80 },
      { key: "birthCity", label: "Birth City", max: 80 },
      { key: "birthCountry", label: "Birth Country/Region", max: 80 },
      { key: "dateOfBirth", label: "Date of Birth", max: 40, placeholder: DATE },
      { key: "maritalStatus", label: "Marital Status", max: 40, options: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"] },
      { key: "sponsorshipTransfers", label: "No. of sponsorship transfers", max: 10, initial: "0" },
      { key: "religion", label: "Religion", max: 40, options: ["Islam", "Christianity", "Hinduism", "Buddhism", "Other"] },
      { key: "workPermit", label: "Work Permit", max: 80 },
      { key: "biometricsCollected", label: "Biometrics Collected", max: 20, options: ["Yes", "No"] },
      { key: "travelStatus", label: "Travel Status", max: 40, options: ["Inside", "Outside"] },
    ],
  },
  {
    title: "Sponsor Details",
    fields: [
      { key: "sponsorName", label: "Sponsor Name", max: 160 },
      { key: "sponsorId", label: "Sponsor ID Number", max: 40 },
    ],
  },
  {
    title: "Health Insurance",
    fields: [
      { key: "insuranceIssueDate", label: "Issuing Date", max: 40, placeholder: DATE },
      { key: "insuranceExpiryDate", label: "Expiry Date", max: 40, placeholder: DATE },
      { key: "bloodType", label: "Blood Type", max: 10, options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    ],
  },
  {
    title: "Passport",
    fields: [
      { key: "amountDeposit", label: "Amount deposit", max: 40, initial: "SAR 0.00" },
      { key: "passportNumber", label: "Passport Number", max: 40 },
      { key: "passportType", label: "Type", max: 40, initial: "Normal", options: ["Normal", "Diplomatic", "Special"] },
      { key: "passportIssueDate", label: "Issuing Date", max: 40, placeholder: DATE },
      { key: "passportExpiryDate", label: "Expiry Date", max: 40, placeholder: DATE },
      { key: "passportIssueCity", label: "Issuing City", max: 80 },
      { key: "passportStatus", label: "Status", max: 40 },
    ],
  },
  {
    title: "My Resident ID",
    fields: [
      { key: "idVersion", label: "ID Version", max: 10, initial: "1" },
      { key: "idIssueDate", label: "Issuing Date", max: 40, placeholder: DATE },
      { key: "idExpiryDate", label: "Expiry Date", max: 40, placeholder: DATE },
    ],
  },
];

/** Every field in form order (handy for loops and initial values). */
export const absherFields = absherSections.flatMap(section => section.fields);
