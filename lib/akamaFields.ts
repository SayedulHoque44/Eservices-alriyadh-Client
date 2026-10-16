/**
 * Certificate fields, grouped and ordered exactly as on the health certificate card.
 *
 * Used by the public card (components/akama/HealthCertificateCard.tsx) and the
 * admin form (components/admin/AkamaFormModal.tsx), so both always show the
 * same Arabic labels in the same order.
 */
import type { AkamaDetails } from "./types";

export type AkamaField = {
  key: keyof AkamaDetails;
  label: string; // Arabic label shown on the card and in the form
  hint: string; // English meaning, shown in the admin form
  max: number; // max length (matches akama.validation.ts on the server)
  strong?: boolean; // bold value on the card (text values like names)
  optional?: boolean; // may be left empty (form does not require it)
};

export type AkamaFieldSection = { title: string; hint: string; fields: AkamaField[] };

export const akamaSections: AkamaFieldSection[] = [
  {
    title: "بيانات الشهادة:",
    hint: "Certificate details",
    fields: [
      { key: "certificateNumber", label: "رقم الشهادة", hint: "Certificate number", max: 80 },
      { key: "issueDate", label: "تاريخ الإصدار", hint: "Issue date", max: 40 },
      { key: "expiryDate", label: "نهاية الصلاحية", hint: "Expiry date", max: 40 },
    ],
  },
  {
    title: "بيانات صاحب الشهادة:",
    hint: "Certificate holder",
    fields: [
      { key: "name", label: "الاسم", hint: "Name", max: 120, strong: true },
      { key: "identityNumber", label: "رقم الهوية", hint: "ID number", max: 80 },
      { key: "gender", label: "الجنس", hint: "Gender", max: 40, strong: true },
      { key: "nationality", label: "الجنسية", hint: "Nationality", max: 80, strong: true },
      { key: "profession", label: "المهنة", hint: "Profession", max: 160, strong: true },
      { key: "trainingProgram", label: "البرنامج التثقيفي", hint: "Training program", max: 160, strong: true },
      { key: "programCompletionDate", label: "تاريخ إنهاء البرنامج", hint: "Program completion date", max: 60 },
    ],
  },
  {
    title: "بيانات المنشأة:",
    hint: "Organization",
    fields: [
      { key: "organizationName", label: "اسم المنشأة", hint: "Organization name", max: 160, strong: true, optional: true },
      { key: "organizationLicenseNumber", label: "رقم رخصة المنشأة", hint: "Organization license number", max: 80, optional: true },
    ],
  },
];

/** Every field in card order (handy for loops and empty initial values). */
export const akamaFields = akamaSections.flatMap(section => section.fields);
