"use server";

import { headers } from "next/headers";
import { contactSubmissions, db } from "@/lib/db";
import { sendContactNotificationEmail } from "@/lib/email";
import { checkContactRateLimit, getClientIp } from "@/lib/ratelimit";
import { verifyTurnstileToken } from "@/lib/turnstile";

import { contactSchema } from "@/lib/validations/contact";

export type { ContactFormData } from "@/lib/validations/contact";

export async function submitContactFormAction(formData: FormData): Promise<{
  success?: boolean;
  error?: string;
}> {
  // 1. IP Rate Limiting: Max 5 submissions per 10 minutes per IP
  const headerList = await headers();
  const clientIp = getClientIp(headerList);
  const rateCheck = await checkContactRateLimit(clientIp);
  if (!rateCheck.success) {
    return {
      error:
        "You have submitted multiple messages recently. Please wait 10 minutes before submitting again.",
    };
  }

  const rawData = {
    name: (formData.get("name") as string) || "",
    email: (formData.get("email") as string) || "",
    phone: (formData.get("phone") as string) || null,
    personaType: (formData.get("personaType") as string) || "parent",
    subject: (formData.get("subject") as string) || null,
    message: (formData.get("message") as string) || "",
    turnstileToken: (formData.get("turnstileToken") as string) || null,
  };

  const parsed = contactSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      error: firstIssue?.message || "Please check the form for errors.",
    };
  }

  // 2. Verify Turnstile token (spam protection)
  const turnstileCheck = await verifyTurnstileToken(parsed.data.turnstileToken);
  if (!turnstileCheck.success) {
    return {
      error:
        turnstileCheck.error || "Spam verification failed. Please try again.",
    };
  }

  // 2. Insert into Neon Postgres database
  try {
    // Map UI persona identifiers to database enum
    const dbPersona: "parent" | "teacher" | "school" | "partner" | "other" =
      parsed.data.personaType === "school_leader"
        ? "school"
        : parsed.data.personaType === "general"
          ? "other"
          : (parsed.data.personaType as "parent" | "teacher" | "partner");

    await db.insert(contactSubmissions).values({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      personaType: dbPersona,
      subject: parsed.data.subject,
      message: parsed.data.message,
      status: "new",
    });

    // 3. Dispatch automated email notification to admin desk
    try {
      await sendContactNotificationEmail({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        personaType: parsed.data.personaType,
        subject: parsed.data.subject,
        message: parsed.data.message,
      });
    } catch (emailErr) {
      console.warn(
        "Failed to dispatch email alert, but submission was saved:",
        emailErr,
      );
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to save contact submission:", err);
    return {
      error:
        "Unable to submit your message right now. Please try again or contact us directly via email.",
    };
  }
}
