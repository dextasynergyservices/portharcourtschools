import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Please enter your full name (at least 2 characters)"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional().nullable(),
  personaType: z
    .enum(["parent", "teacher", "school_leader", "partner", "general"])
    .default("parent"),
  subject: z.string().optional().nullable(),
  message: z
    .string()
    .min(10, "Please provide a detailed message (at least 10 characters)"),
  turnstileToken: z.string().optional().nullable(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const nominationSchema = z.object({
  nomineeName: z.string().min(2, "Nominee teacher name is required"),
  nomineeSchool: z.string().min(2, "School name is required"),
  nominatorName: z.string().min(2, "Your name is required"),
  nominatorEmail: z.string().email("Valid email address is required"),
  nominatorPhone: z.string().optional().nullable(),
  category: z.string().min(2, "Award category is required"),
  reason: z
    .string()
    .min(10, "Please provide a brief reason for your nomination"),
});

export type NominationFormData = z.infer<typeof nominationSchema>;

export const partnerSchema = z.object({
  name: z.string().min(2, "Your name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().optional().nullable(),
  organization: z.string().min(2, "Organization or company name is required"),
  message: z
    .string()
    .min(10, "Please share brief details on how you'd like to partner"),
});

export type PartnerFormData = z.infer<typeof partnerSchema>;

export const registrationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(8, "Valid phone number is required"),
  schoolName: z.string().optional().nullable(),
  role: z.string().default("teacher"),
  ticketQuantity: z.coerce.number().min(1).max(20).default(1),
  notes: z.string().optional().nullable(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
