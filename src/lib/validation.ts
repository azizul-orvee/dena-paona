import { z } from "zod";

/** Trimmed and lower-cased so lookups match how accounts are stored. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter an email address")
  .pipe(z.email("That doesn't look like an email address"));

export const entrySchema = z.object({
  kind: z.enum(["dena", "paona"]),
  personName: z.string().trim().min(1, "Who is this with?").max(80),
  personPhone: z
    .string()
    .trim()
    .max(24, "That phone number is too long")
    .optional()
    .transform((v) => (v ? v.replace(/[\s\-().]/g, "") : null))
    .refine(
      (v) => v === null || /^\+?\d{6,15}$/.test(v),
      "Enter a valid phone number, e.g. 01712345678",
    ),
  personAddress: z
    .string()
    .trim()
    .max(200, "Keep the address under 200 characters")
    .optional()
    .transform((v) => (v ? v : null)),
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount")
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount, e.g. 1500 or 1500.50")
    .refine((v) => Number(v) > 0, "Amount must be greater than zero")
    .refine((v) => Number(v) <= 99_999_999_999, "That amount is too large"),
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : null)),
  dueDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .refine(
      (v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Use a valid date",
    ),
});

export const paymentSchema = z.object({
  entryId: z.uuid(),
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount")
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount")
    .refine((v) => Number(v) > 0, "Amount must be greater than zero"),
});

export const shareSchema = z.object({
  email: emailSchema,
});
