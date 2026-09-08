"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { invalidateCache } from "@/lib/cache";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { db, eventRegistrations, events } from "@/lib/db";
import { sendEventRegistrationConfirmedEmail } from "@/lib/email";

import { eventSchema } from "@/lib/validations/event";

export type EventActionState = {
  error?: string;
  success?: boolean;
  slug?: string;
  id?: string;
};

export async function checkEventSlugAvailabilityAction(
  slug: string,
  currentEventId?: string,
): Promise<{ available: boolean }> {
  if (!slug || slug.length < 2) {
    return { available: false };
  }

  const conditions = [eq(events.slug, slug.trim().toLowerCase())];
  if (currentEventId) {
    conditions.push(ne(events.id, currentEventId));
  }

  const [existing] = await db
    .select({ id: events.id })
    .from(events)
    .where(and(...conditions))
    .limit(1);

  return { available: !existing };
}

export async function createEventAction(
  _prevState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const role = (session.user as { role?: string }).role || "creator";
  const rawTitle = formData.get("title") as string;
  const rawSlug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || "";
  const type =
    (formData.get("type") as
      | "summit"
      | "masterclass"
      | "workshop"
      | "awards") || "summit";
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = (formData.get("endDate") as string) || null;
  const venue = (formData.get("venue") as string) || "";
  const coverImage = (formData.get("coverImage") as string) || null;
  const isPaid =
    formData.get("isPaid") === "true" || formData.get("isPaid") === "on";
  const rawPrice = formData.get("price");
  const paymentLink = (formData.get("paymentLink") as string) || null;
  const status =
    (formData.get("status") as
      | "draft"
      | "in_review"
      | "published"
      | "archived") || "draft";

  // Role gating: Creators cannot publish directly
  if (role === "creator" && (status === "published" || status === "archived")) {
    return {
      error: "Creators can only save as Draft or submit for In Review.",
    };
  }

  // Parse & validate
  const parsed = eventSchema.safeParse({
    title: rawTitle,
    slug: rawSlug,
    description,
    type,
    startDate: startDateStr,
    endDate: endDateStr,
    venue,
    coverImage,
    isPaid,
    price: isPaid ? (rawPrice ? Number(rawPrice) : 0) : 0,
    paymentLink: isPaid ? paymentLink : null,
    status,
  });

  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { error: errorMsg };
  }

  const data = parsed.data;

  // Check slug uniqueness
  const [existingSlug] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.slug, data.slug))
    .limit(1);

  if (existingSlug) {
    return {
      error:
        "An event with this URL slug already exists. Please choose a unique slug.",
    };
  }

  try {
    const [newEvent] = await db
      .insert(events)
      .values({
        title: data.title,
        slug: data.slug,
        description: data.description,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        venue: data.venue,
        coverImage: data.coverImage,
        isPaid: data.isPaid,
        price: data.price,
        paymentLink: data.isPaid ? data.paymentLink : null,
        status: data.status,
      })
      .returning({ id: events.id, slug: events.slug });

    revalidatePath("/events");
    revalidatePath(`/events/${newEvent.slug}`);
    revalidatePath("/admin/events");
    revalidatePath("/");
    await invalidateCache(["events", "homepage"]);

    return { success: true, slug: newEvent.slug, id: newEvent.id };
  } catch (err) {
    console.error("Failed to create event:", err);
    return {
      error: "An unexpected database error occurred. Please try again.",
    };
  }
}

export async function updateEventAction(
  id: string,
  _prevState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const role = (session.user as { role?: string }).role || "creator";
  const rawTitle = formData.get("title") as string;
  const rawSlug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || "";
  const type =
    (formData.get("type") as
      | "summit"
      | "masterclass"
      | "workshop"
      | "awards") || "summit";
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = (formData.get("endDate") as string) || null;
  const venue = (formData.get("venue") as string) || "";
  const coverImage = (formData.get("coverImage") as string) || null;
  const isPaid =
    formData.get("isPaid") === "true" || formData.get("isPaid") === "on";
  const rawPrice = formData.get("price");
  const paymentLink = (formData.get("paymentLink") as string) || null;
  const status =
    (formData.get("status") as
      | "draft"
      | "in_review"
      | "published"
      | "archived") || "draft";

  if (role === "creator" && (status === "published" || status === "archived")) {
    return {
      error: "Creators cannot publish or archive events.",
    };
  }

  const parsed = eventSchema.safeParse({
    title: rawTitle,
    slug: rawSlug,
    description,
    type,
    startDate: startDateStr,
    endDate: endDateStr,
    venue,
    coverImage,
    isPaid,
    price: isPaid ? (rawPrice ? Number(rawPrice) : 0) : 0,
    paymentLink: isPaid ? paymentLink : null,
    status,
  });

  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { error: errorMsg };
  }

  const data = parsed.data;

  try {
    const [existingEvent] = await db
      .select({ id: events.id, slug: events.slug })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!existingEvent) {
      return { error: "Event not found." };
    }

    // Uniqueness check for slug
    if (existingEvent.slug !== data.slug) {
      const [conflict] = await db
        .select({ id: events.id })
        .from(events)
        .where(and(eq(events.slug, data.slug), ne(events.id, id)))
        .limit(1);

      if (conflict) {
        return { error: "This slug is already taken by another event." };
      }
    }

    await db
      .update(events)
      .set({
        title: data.title,
        slug: data.slug,
        description: data.description,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        venue: data.venue,
        coverImage: data.coverImage,
        isPaid: data.isPaid,
        price: data.price,
        paymentLink: data.isPaid ? data.paymentLink : null,
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id));

    revalidatePath("/events");
    revalidatePath(`/events/${data.slug}`);
    if (existingEvent.slug !== data.slug) {
      revalidatePath(`/events/${existingEvent.slug}`);
    }
    revalidatePath("/admin/events");
    revalidatePath("/");
    await invalidateCache(["events", "homepage"]);

    return { success: true, slug: data.slug, id };
  } catch (err) {
    console.error("Failed to update event:", err);
    return {
      error: "An unexpected database error occurred. Please try again.",
    };
  }
}

export async function deleteEventAction(
  id: string,
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized." };
  }

  const role = (session.user as { role?: string }).role || "creator";
  if (role === "creator") {
    return { error: "Creators do not have permission to delete events." };
  }

  try {
    const [existing] = await db
      .select({ slug: events.slug })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    await db.delete(events).where(eq(events.id, id));

    revalidatePath("/events");
    if (existing) {
      revalidatePath(`/events/${existing.slug}`);
    }
    revalidatePath("/admin/events");
    revalidatePath("/");
    await invalidateCache(["events", "homepage"]);

    return { success: true };
  } catch (err) {
    console.error("Failed to delete event:", err);
    return { error: "Failed to delete event." };
  }
}

export async function updateEventRegistrationStatusAction(
  registrationId: string,
  status: "pending_payment" | "confirmed" | "cancelled",
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  try {
    const [existing] = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, registrationId))
      .limit(1);

    if (!existing) {
      return { error: "Registration not found." };
    }

    await db
      .update(eventRegistrations)
      .set({ status, updatedAt: new Date() })
      .where(eq(eventRegistrations.id, registrationId));

    // If transitioned to confirmed, dispatch the ticket confirmation email with Google Calendar URL
    if (status === "confirmed" && existing.status !== "confirmed") {
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, existing.eventId))
        .limit(1);

      if (event) {
        const eventDateStr = new Date(event.startDate).toLocaleDateString(
          "en-NG",
          {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        );

        const calendarUrl = generateGoogleCalendarUrl({
          title: event.title,
          description: event.description,
          venue: event.venue,
          startDate: event.startDate,
          endDate: event.endDate,
        });

        sendEventRegistrationConfirmedEmail({
          attendeeName: existing.fullName,
          email: existing.email,
          eventTitle: event.title,
          eventDateStr,
          eventVenue: event.venue,
          ticketQuantity: existing.ticketQuantity,
          isPaid: event.isPaid,
          totalAmount: existing.totalAmount,
          registrationId: existing.id,
          calendarUrl,
        }).catch((e) =>
          console.error("Confirmed status transition email error:", e),
        );
      }
    }

    revalidatePath("/admin/events");
    revalidatePath("/admin/events/registrations");
    return { success: true };
  } catch (err) {
    console.error("Failed to update registration status:", err);
    return { error: "Failed to update registration status." };
  }
}

export async function deleteEventRegistrationAction(
  registrationId: string,
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const role = (session.user as { role?: string }).role || "creator";
  if (role !== "super_admin" && role !== "admin") {
    return { error: "You do not have permission to delete registrations." };
  }

  try {
    await db
      .delete(eventRegistrations)
      .where(eq(eventRegistrations.id, registrationId));

    revalidatePath("/admin/events");
    revalidatePath("/admin/events/registrations");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete registration:", err);
    return { error: "Failed to delete registration." };
  }
}
