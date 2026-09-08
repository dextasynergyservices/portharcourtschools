import { describe, expect, it } from "vitest";
import {
  contactSchema,
  nominationSchema,
  partnerSchema,
  registrationSchema,
} from "@/lib/validations/contact";

describe("Public Submission Schemas Validation", () => {
  describe("contactSchema", () => {
    const validContact = {
      name: "Tari Briggs",
      email: "tari.briggs@example.com",
      phone: "+2348031234567",
      personaType: "parent" as const,
      subject: "Primary school inquiries in Old GRA",
      message:
        "Hello, I am seeking guidance on admission policies for Grade 1 pupils.",
    };

    it("accepts valid contact submission payload", () => {
      const res = contactSchema.safeParse(validContact);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.name).toBe("Tari Briggs");
        expect(res.data.personaType).toBe("parent");
      }
    });

    it("rejects invalid email formats", () => {
      const res = contactSchema.safeParse({
        ...validContact,
        email: "invalid-email",
      });
      expect(res.success).toBe(false);
    });

    it("rejects message shorter than 10 characters", () => {
      const res = contactSchema.safeParse({
        ...validContact,
        message: "Too short",
      });
      expect(res.success).toBe(false);
    });

    it("defaults personaType to parent if unspecified", () => {
      const { personaType, ...withoutPersona } = validContact;
      const res = contactSchema.safeParse(withoutPersona);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.personaType).toBe("parent");
      }
    });
  });

  describe("partnerSchema", () => {
    it("validates a partnership inquiry payload", () => {
      const res = partnerSchema.safeParse({
        name: "Dr. Amadi",
        email: "amadi@techcorp.ng",
        organization: "TechCorp Rivers",
        message:
          "We would like to sponsor the STEM workshop with hardware kits.",
      });
      expect(res.success).toBe(true);
    });

    it("requires organization name", () => {
      const res = partnerSchema.safeParse({
        name: "Dr. Amadi",
        email: "amadi@techcorp.ng",
        organization: "A",
        message: "We would like to sponsor the workshop with hardware kits.",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("nominationSchema", () => {
    it("validates teacher award nomination", () => {
      const res = nominationSchema.safeParse({
        nomineeName: "Mrs. Ngozi Eze",
        nomineeSchool: "Graceland International School",
        nominatorName: "Ibifuro Princewill",
        nominatorEmail: "ibifuro@example.com",
        category: "STEM Educator of the Year",
        reason:
          "Demonstrated phenomenal dedication mentoring students in robotics and national Olympiad.",
      });
      expect(res.success).toBe(true);
    });
  });

  describe("registrationSchema", () => {
    it("validates event attendee registration", () => {
      const res = registrationSchema.safeParse({
        eventId: "event-12345",
        fullName: "Chidi Peters",
        email: "chidi@example.com",
        phone: "+2348039876543",
        role: "school_leader",
        ticketQuantity: 2,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.ticketQuantity).toBe(2);
      }
    });

    it("rejects ticket quantities outside the 1 to 20 range", () => {
      const res0 = registrationSchema.safeParse({
        eventId: "event-12345",
        fullName: "Chidi Peters",
        email: "chidi@example.com",
        phone: "+2348039876543",
        ticketQuantity: 0,
      });
      expect(res0.success).toBe(false);

      const res25 = registrationSchema.safeParse({
        eventId: "event-12345",
        fullName: "Chidi Peters",
        email: "chidi@example.com",
        phone: "+2348039876543",
        ticketQuantity: 25,
      });
      expect(res25.success).toBe(false);
    });
  });
});
