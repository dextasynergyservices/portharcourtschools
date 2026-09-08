import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { db, eventRegistrations, events } from "@/lib/db";
import { sendEventRegistrationConfirmedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    // Verify webhook signature if secret key is present
    if (paystackSecret) {
      const signature = req.headers.get("x-paystack-signature");
      const hash = crypto
        .createHmac("sha512", paystackSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== hash) {
        console.warn("Invalid Paystack webhook signature.");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 },
        );
      }
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === "charge.success") {
      const data = payload.data;
      const customerEmail = (data.customer?.email as string)
        ?.toLowerCase()
        .trim();
      const metadataRegistrationId = data.metadata?.registration_id as
        | string
        | undefined;

      let registration = null;

      // 1. Match by registrationId in metadata if provided
      if (metadataRegistrationId) {
        const [found] = await db
          .select()
          .from(eventRegistrations)
          .where(eq(eventRegistrations.id, metadataRegistrationId))
          .limit(1);
        registration = found;
      }

      // 2. Fallback: match most recent pending registration by customer email
      if (!registration && customerEmail) {
        const [found] = await db
          .select()
          .from(eventRegistrations)
          .where(eq(eventRegistrations.email, customerEmail))
          .limit(1);
        registration = found;
      }

      if (registration && registration.status !== "confirmed") {
        // Update registration status to confirmed
        await db
          .update(eventRegistrations)
          .set({
            status: "confirmed",
            updatedAt: new Date(),
          })
          .where(eq(eventRegistrations.id, registration.id));

        // Fetch event details for confirmation email and calendar URL
        const [event] = await db
          .select()
          .from(events)
          .where(eq(events.id, registration.eventId))
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
            attendeeName: registration.fullName,
            email: registration.email,
            eventTitle: event.title,
            eventDateStr,
            eventVenue: event.venue,
            ticketQuantity: registration.ticketQuantity,
            isPaid: true,
            totalAmount: registration.totalAmount,
            registrationId: registration.id,
            calendarUrl,
          }).catch((e) =>
            console.error("Paystack webhook confirmation email error:", e),
          );
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Error processing Paystack webhook:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
