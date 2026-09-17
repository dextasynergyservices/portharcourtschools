"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import {
  contactSubmissions,
  db,
  eventRegistrations,
  events,
  nominations,
} from "@/lib/db";
import {
  sendContactNotificationEmail,
  sendEventPaymentPendingEmail,
  sendEventRegistrationConfirmedEmail,
} from "@/lib/email";
import {
  checkContactRateLimit,
  checkNominationRateLimit,
  checkRegistrationRateLimit,
  getClientIp,
} from "@/lib/ratelimit";

import {
  nominationSchema,
  partnerSchema,
  registrationSchema,
} from "@/lib/validations/contact";

export async function createNominationAction(formData: FormData): Promise<{
  success?: boolean;
  error?: string;
}> {
  // IP Rate limiting
  const headerList = await headers();
  const clientIp = getClientIp(headerList);
  const rateCheck = await checkNominationRateLimit(clientIp);
  if (!rateCheck.success) {
    return {
      error:
        "You have submitted multiple nominations recently. Please wait 10 minutes before trying again.",
    };
  }

  const nomineeName = (formData.get("nomineeName") as string) || "";
  const nomineeSchool = (formData.get("nomineeSchool") as string) || "";
  const nominatorName = (formData.get("nominatorName") as string) || "";
  const nominatorEmail = (formData.get("nominatorEmail") as string) || "";
  const nominatorPhone = (formData.get("nominatorPhone") as string) || null;
  const category = (formData.get("category") as string) || "";
  const reason = (formData.get("reason") as string) || "";

  const parsed = nominationSchema.safeParse({
    nomineeName,
    nomineeSchool,
    nominatorName,
    nominatorEmail,
    nominatorPhone,
    category,
    reason,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Invalid nomination data.",
    };
  }

  try {
    await db.insert(nominations).values({
      nomineeName: parsed.data.nomineeName,
      nomineeSchool: parsed.data.nomineeSchool,
      nominatorName: parsed.data.nominatorName,
      nominatorEmail: parsed.data.nominatorEmail,
      nominatorPhone: parsed.data.nominatorPhone,
      category: parsed.data.category,
      reason: parsed.data.reason,
      status: "new",
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to submit nomination:", err);
    return {
      error: "Unable to submit nomination right now. Please try again.",
    };
  }
}

export async function createEventPartnerInquiryAction(
  formData: FormData,
): Promise<{
  success?: boolean;
  error?: string;
}> {
  // IP Rate limiting
  const headerList = await headers();
  const clientIp = getClientIp(headerList);
  const rateCheck = await checkContactRateLimit(clientIp);
  if (!rateCheck.success) {
    return {
      error:
        "You have submitted multiple partnership inquiries recently. Please wait 10 minutes before trying again.",
    };
  }

  const name = (formData.get("name") as string) || "";
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || null;
  const organization = (formData.get("organization") as string) || "";
  const message = (formData.get("message") as string) || "";

  const parsed = partnerSchema.safeParse({
    name,
    email,
    phone,
    organization,
    message,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Invalid inquiry data.",
    };
  }

  try {
    await db.insert(contactSubmissions).values({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      personaType: "partner",
      subject: `Event Partnership Inquiry from ${parsed.data.organization}`,
      message: parsed.data.message,
      status: "new",
    });

    // Notify admin team asynchronously
    sendContactNotificationEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      personaType: "partner",
      subject: `Event Partnership Inquiry from ${parsed.data.organization}`,
      message: parsed.data.message,
    }).catch((e) => console.error("Partner email dispatch error:", e));

    return { success: true };
  } catch (err) {
    console.error("Failed to submit partnership inquiry:", err);
    return { error: "Unable to submit inquiry right now. Please try again." };
  }
}

export async function createEventRegistrationAction(
  formData: FormData,
): Promise<{
  success?: boolean;
  error?: string;
  isPaid?: boolean;
  totalAmount?: number;
  paymentLink?: string | null;
  registrationId?: string;
}> {
  // IP Rate limiting
  const headerList = await headers();
  const clientIp = getClientIp(headerList);
  const rateCheck = await checkRegistrationRateLimit(clientIp);
  if (!rateCheck.success) {
    return {
      error:
        "Too many registration requests. Please wait a few minutes before registering again.",
    };
  }

  const eventId = (formData.get("eventId") as string) || "";
  const fullName = (formData.get("fullName") as string) || "";
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const schoolName = (formData.get("schoolName") as string) || null;
  const role = (formData.get("role") as string) || "teacher";
  const rawQty = formData.get("ticketQuantity");
  const ticketQuantity = rawQty ? Number(rawQty) : 1;
  const notes = (formData.get("notes") as string) || null;
  const ticketTierName = (formData.get("ticketTierName") as string) || null;

  const parsed = registrationSchema.safeParse({
    eventId,
    fullName,
    email,
    phone,
    schoolName,
    role,
    ticketQuantity,
    notes,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Invalid registration details.",
    };
  }

  // 1. Fetch event from database to verify availability and pricing
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, parsed.data.eventId))
    .limit(1);

  if (!event || event.status !== "published") {
    return { error: "This event is not currently accepting registrations." };
  }

  // 2. Server-side price & payment link verification (Provider-Agnostic)
  // Never trust client-submitted tier price or payment link from formData
  let verifiedUnitPrice = event.isPaid ? event.price || 0 : 0;
  let verifiedPaymentLink = event.paymentLink || null;

  if (ticketTierName && Array.isArray(event.ticketTiers)) {
    const matchedTier = event.ticketTiers.find(
      (t) =>
        t.name.trim().toLowerCase() === ticketTierName.trim().toLowerCase(),
    );
    if (matchedTier) {
      verifiedUnitPrice = matchedTier.price ?? verifiedUnitPrice;
      if (matchedTier.paymentLink) {
        verifiedPaymentLink = matchedTier.paymentLink;
      }
    }
  }

  const totalAmount = verifiedUnitPrice * parsed.data.ticketQuantity;
  const isPaidEvent = totalAmount > 0;
  const initialStatus = isPaidEvent ? "pending_payment" : "confirmed";

  try {
    const [reg] = await db
      .insert(eventRegistrations)
      .values({
        eventId: event.id,
        fullName: parsed.data.fullName,
        email: parsed.data.email.toLowerCase().trim(),
        phone: parsed.data.phone.trim(),
        schoolName: parsed.data.schoolName?.trim() || null,
        role: parsed.data.role,
        ticketQuantity: parsed.data.ticketQuantity,
        ticketTierName,
        ticketTierPrice: verifiedUnitPrice,
        totalAmount,
        status: initialStatus,
        notes: parsed.data.notes,
      })
      .returning({ id: eventRegistrations.id });

    // 3. Provider-Agnostic Payment Link Formatter
    // Works with ANY payment provider link (Paystack, Flutterwave, Selar, Stripe, Moniepoint, etc.)
    let finalPaymentLink = verifiedPaymentLink;
    if (isPaidEvent && finalPaymentLink) {
      try {
        const urlObj = new URL(finalPaymentLink);
        // Only format secure HTTPS payment links
        if (urlObj.protocol === "https:") {
          // Attach standard query parameters supported by common payment gateways
          if (!urlObj.searchParams.has("email")) {
            urlObj.searchParams.set("email", parsed.data.email.trim());
          }
          if (!urlObj.searchParams.has("name")) {
            urlObj.searchParams.set("name", parsed.data.fullName.trim());
          }
          if (!urlObj.searchParams.has("ref")) {
            urlObj.searchParams.set("ref", reg.id);
          }
          if (!urlObj.searchParams.has("registration_id")) {
            urlObj.searchParams.set("registration_id", reg.id);
          }
          finalPaymentLink = urlObj.toString();
        }
      } catch {
        // Retain original payment link if URL parsing is non-standard
      }
    }

    const eventDateStr = new Date(event.startDate).toLocaleDateString("en-NG", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (isPaidEvent) {
      // Send payment pending email with direct payment link
      sendEventPaymentPendingEmail({
        attendeeName: parsed.data.fullName,
        email: parsed.data.email,
        eventTitle: event.title,
        eventDateStr,
        eventVenue: event.venue,
        ticketQuantity: parsed.data.ticketQuantity,
        ticketTierName,
        totalAmount,
        paymentLink: finalPaymentLink || "#",
        registrationId: reg.id,
      }).catch((e) => console.error("Payment pending email error:", e));
    } else {
      // Free event: send confirmed ticket email with Google Calendar invite
      const calendarUrl = generateGoogleCalendarUrl({
        title: event.title,
        description: event.description,
        venue: event.venue,
        startDate: event.startDate,
        endDate: event.endDate,
      });

      sendEventRegistrationConfirmedEmail({
        attendeeName: parsed.data.fullName,
        email: parsed.data.email,
        eventTitle: event.title,
        eventDateStr,
        eventVenue: event.venue,
        ticketQuantity: parsed.data.ticketQuantity,
        ticketTierName,
        isPaid: false,
        totalAmount: 0,
        registrationId: reg.id,
        calendarUrl,
      }).catch((e) => console.error("Free registration email error:", e));
    }

    return {
      success: true,
      registrationId: reg.id,
      isPaid: isPaidEvent,
      totalAmount,
      paymentLink: finalPaymentLink,
    };
  } catch (err) {
    console.error("Failed to register for event:", err);
    return {
      error: "Unable to complete registration. Please try again.",
    };
  }
}
