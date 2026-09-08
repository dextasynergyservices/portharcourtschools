import { db, events, programmes } from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding events and programmes...");

  // 1. Initial Events
  const initialEvents = [
    {
      title:
        "The Teachers Spotlight Education Summit & Classroom Champions Awards 2026",
      slug: "teachers-spotlight-summit-awards-2026",
      type: "summit" as const,
      startDate: new Date("2026-11-21T09:00:00.000Z"),
      endDate: new Date("2026-11-21T17:00:00.000Z"),
      venue: "Celebrate Center, Olu Obasanjo Road, Port Harcourt",
      description:
        "A day dedicated to two things Nigerian education needs more of: honest conversation and honest recognition. Brings together school proprietors, principals, educators, and institutional partners across Rivers State for keynote panels and the inaugural Classroom Champions Awards ceremony.",
      status: "published" as const,
      isPaid: true,
      price: 25000,
      paymentLink: "https://paystack.com/pay/portharcourtschools-summit-2026",
      coverImage: "/images/ph_hero_classroom.jpg",
    },
    {
      title: "Curriculum Leadership & Star Teacher Retention Masterclass",
      slug: "curriculum-leadership-teacher-retention-masterclass",
      type: "masterclass" as const,
      startDate: new Date("2026-10-10T10:00:00.000Z"),
      endDate: new Date("2026-10-10T15:30:00.000Z"),
      venue: "GeePhill Training Hub, GRA Phase 2, Port Harcourt",
      description:
        "High-impact executive workshop for school proprietors, directors, and headteachers on institutional governance, modernizing curriculum delivery, and keeping exceptional teachers in an increasingly competitive environment.",
      status: "published" as const,
      isPaid: true,
      price: 15000,
      paymentLink: "https://flutterwave.com/pay/curriculum-leadership-ph",
      coverImage: "/images/ph_hero_classroom.jpg",
    },
    {
      title: "Modern Classroom Pedagogy & STEM Integration Workshop",
      slug: "modern-classroom-pedagogy-stem-workshop",
      type: "workshop" as const,
      startDate: new Date("2026-12-05T09:30:00.000Z"),
      endDate: new Date("2026-12-05T14:00:00.000Z"),
      venue: "Port Harcourt ICT Innovation Center, Stadium Road",
      description:
        "Hands-on competency development for primary and secondary school educators on interactive STEM teaching methods, low-cost laboratory simulations, and student digital literacy.",
      status: "published" as const,
      isPaid: false,
      price: 0,
      paymentLink: null,
      coverImage: "/images/ph_hero_classroom.jpg",
    },
  ];

  for (const event of initialEvents) {
    await db
      .insert(events)
      .values(event)
      .onConflictDoUpdate({
        target: events.slug,
        set: {
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          venue: event.venue,
          type: event.type,
          isPaid: event.isPaid,
          price: event.price,
          paymentLink: event.paymentLink,
          status: event.status,
          updatedAt: new Date(),
        },
      });
    console.log(`✓ Seeded event: ${event.title}`);
  }

  // 2. Initial Programmes (Accredited Training with GeePhill)
  const initialProgrammes = [
    {
      title: "TRCN-Accredited CPD Sessions",
      slug: "trcn-accredited-cpd-sessions",
      provider: "GeePhill",
      category: "Teacher Professional Development",
      isAccredited: true,
      description:
        "Continuing professional development modules for licensed teachers, covering modern pedagogy, digital classroom integration, ethics, and TRCN competency benchmarks.",
      coverImage: "/images/ph_hero_classroom.jpg",
      status: "published" as const,
    },
    {
      title: "School Leadership & Management Training",
      slug: "school-leadership-management-training",
      provider: "GeePhill",
      category: "Institutional Governance",
      isAccredited: true,
      description:
        "Strategic executive workshops for school proprietors, principals, and headteachers on institutional resilience, teacher retention, compliance, and financial sustainability.",
      coverImage: "/images/ph_hero_classroom.jpg",
      status: "published" as const,
    },
    {
      title: "Front Desk & Admissions Excellence",
      slug: "front-desk-admissions-excellence",
      provider: "GeePhill",
      category: "Operations & Parent Experience",
      isAccredited: false,
      description:
        "Specialized customer care, inquiry conversion, and professional communication training for school administrative and front-office staff managing prospective parent visits.",
      coverImage: "/images/ph_hero_classroom.jpg",
      status: "published" as const,
    },
    {
      title: "Custom In-School Workshops & Masterclasses",
      slug: "custom-in-school-workshops",
      provider: "GeePhill",
      category: "Bespoke School Training",
      isAccredited: true,
      description:
        "Tailored on-campus training modules designed specifically around your school's unique curriculum targets, diagnostic teacher evaluations, and termly development milestones.",
      coverImage: "/images/ph_hero_classroom.jpg",
      status: "published" as const,
    },
  ];

  for (const prog of initialProgrammes) {
    await db
      .insert(programmes)
      .values(prog)
      .onConflictDoUpdate({
        target: programmes.slug,
        set: {
          title: prog.title,
          description: prog.description,
          provider: prog.provider,
          category: prog.category,
          isAccredited: prog.isAccredited,
          status: prog.status,
          updatedAt: new Date(),
        },
      });
    console.log(`✓ Seeded programme: ${prog.title}`);
  }

  console.log("🎉 Events and programmes seeding complete!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
