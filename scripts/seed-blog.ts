import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL environment variable is missing.");
  process.exit(1);
}

const sql = neon(dbUrl);
const db = drizzle({ client: sql, schema });

const CATEGORIES = [
  {
    name: "Parent Corner",
    slug: "parent-corner",
    description:
      "School choice, admissions, what to ask on a tour, and supporting your child at home in Port Harcourt.",
  },
  {
    name: "Teacher & School Leadership",
    slug: "teacher-school-leadership",
    description:
      "Classroom practice, professional development, and modern school management strategies.",
  },
  {
    name: "Curriculum Watch",
    slug: "curriculum-watch",
    description:
      "Updates, explainers, and policy analysis on NERDC and national curriculum transitions.",
  },
  {
    name: "Safeguarding & Wellbeing",
    slug: "safeguarding-wellbeing",
    description:
      "Child protection practices, mental health, and safety standards every school and parent should know.",
  },
  {
    name: "Community Spotlight",
    slug: "community-spotlight",
    description:
      "Features on schools, exceptional educators, and grassroot education initiatives in Rivers State.",
  },
  {
    name: "Events & Announcements",
    slug: "events-announcements",
    description:
      "Official updates on the Teachers Spotlight Summit, accredited masterclasses, and platform events.",
  },
];

const SAMPLE_POSTS = [
  {
    title:
      "Navigating Primary School Admissions in Port Harcourt: What to Ask on a Tour",
    slug: "navigating-primary-school-admissions-port-harcourt",
    categorySlug: "parent-corner",
    excerpt:
      "Beyond shiny swimming pools and air-conditioned buses, here are the essential diagnostic questions parents must ask school leadership before paying acceptance fees.",
    coverImage: "/images/ph_hero_classroom.jpg",
    tags: ["Admissions", "Parents", "School Choice", "Port Harcourt"],
    body: `
      <h2>The Admission Tour Checklist for Port Harcourt Families</h2>
      <p>Choosing a school in Port Harcourt can be overwhelming. With hundreds of private and international options stretching from Old GRA and Peter Odili Road to Woji and Ada George, glossy brochures often emphasize infrastructure over pedagogical substance.</p>
      <p>When touring a school, looking at the science lab and smartboards is only step one. Here are the crucial questions that reveal how a school actually operates when parents aren't looking:</p>
      
      <h3>1. What is your teacher retention rate over the last three academic sessions?</h3>
      <p>High teacher turnover is the single most consistent indicator of administrative dysfunction. If a school loses 40% of its teaching staff annually, your child’s emotional and academic continuity is compromised, regardless of how modern the computer lab is.</p>

      <h3>2. How does the school implement child safeguarding policies?</h3>
      <p>Ask to see the designated safeguarding lead (DSL) framework. Who is vetted before entering classrooms? What background checks are run on support staff and transport drivers? A school that takes safeguarding seriously will answer with immediate clarity, not vague assurances.</p>

      <blockquote>
        "A school's culture is best measured by how the proprietor treats the teachers and how the teachers speak to the youngest students when no camera is rolling."
      </blockquote>

      <h3>3. What curriculum balance do you operate in practice?</h3>
      <p>Many schools advertise a 'British-Nigerian blended curriculum'. Inquire specifically: How does the school transition students between the NERDC primary benchmark and international checkpoint examinations without creating curriculum fatigue?</p>
      <p>Take notes, observe classroom engagement, and speak directly with teachers whenever possible.</p>
    `,
  },
  {
    title:
      "The 2026 NERDC Curriculum Reforms: What Every Rivers State Educator Needs to Know",
    slug: "nerdc-curriculum-reforms-rivers-state-educators",
    categorySlug: "curriculum-watch",
    excerpt:
      "A comprehensive breakdown of the national curriculum revisions, vocational learning mandates, and classroom assessment transitions.",
    coverImage: "/images/ph_schools_map_banner.jpg",
    tags: ["Curriculum", "NERDC", "Policy", "Education Policy"],
    body: `
      <h2>Deconstructing the Latest National Curriculum Directives</h2>
      <p>The Nigerian Educational Research and Development Council (NERDC) has rolled out revised curricular benchmarks aimed at bridging the gap between foundational literacy, digital competency, and vocational skills for primary and secondary tiers.</p>
      
      <h3>Key Policy Pillars in the 2026 Revisions</h3>
      <p>For school administrators in Rivers State, aligning lesson plans with the updated national standards requires attention to three fundamental shifts:</p>
      <ul>
        <li><strong>Early Computational Literacy:</strong> Algorithmic thinking and digital safety integrated into primary science curriculum.</li>
        <li><strong>Applied Vocational Competencies:</strong> Real-world technical, creative, and financial modules embedded into junior secondary schooling.</li>
        <li><strong>Continuous Competency Assessment:</strong> De-emphasizing rote memorization in favor of diagnostic rubric-based evaluations.</li>
      </ul>

      <blockquote>
        "Curriculum updates remain words on paper until teachers receive the structured continuous professional development necessary to translate standards into daily classroom engagement."
      </blockquote>

      <h3>Strategic Steps for School Leaders</h3>
      <p>Proprietors must prioritize accredited in-service training. TRCN-certified CPD sessions provide the practical bridges needed for teaching staff to unpack these NERDC mandates with pedagogical confidence.</p>
    `,
  },
  {
    title:
      "Child Protection Standards: Five Safeguarding Protocols Every School Must Enforce",
    slug: "child-protection-standards-safeguarding-protocols-schools",
    categorySlug: "safeguarding-wellbeing",
    excerpt:
      "Child safety cannot be an afterthought. An actionable operational guide on visitor vetting, incident logging, and mental wellbeing frameworks.",
    coverImage: "/images/ph_hero_classroom.jpg",
    tags: [
      "Safeguarding",
      "Child Protection",
      "Wellbeing",
      "School Governance",
    ],
    body: `
      <h2>Establishing a Zero-Compromise Safeguarding Culture</h2>
      <p>In modern school administration, child safeguarding is a foundational legal and ethical prerequisite. Parents trust schools with their children's physical and emotional safety each morning; that trust demands institutional accountability.</p>

      <h3>1. Mandatory Pre-Employment Background Screening</h3>
      <p>Every employee—from instructional faculty to security officers, cleaners, and bus attendants—must undergo strict verification, including character references and identity verification.</p>

      <h3>2. Dedicated Incident Reporting and Independent Escalation</h3>
      <p>A child or staff member who reports bullying, neglect, or harassment must have a clear, confidential escalation pathway that cannot be buried by internal school politics.</p>

      <h3>3. Physical Campus Surveillance and Blind Spot Audits</h3>
      <p>Regular security audits of campus perimeters, restroom access corridors, and after-school activity zones are non-negotiable for schools in urban Port Harcourt.</p>
    `,
  },
  {
    title:
      "Honouring Our Unsung Champions: Why the Teachers Spotlight Awards Matter",
    slug: "honouring-unsung-champions-teachers-spotlight-awards",
    categorySlug: "community-spotlight",
    excerpt:
      "Across classrooms in Obio-Akpor and Port Harcourt City, dedicated educators shape the future daily. Here is how our public recognition initiative puts them in the spotlight.",
    coverImage: "/images/ph_hero_classroom.jpg",
    tags: ["Teachers Spotlight", "Awards", "Recognition", "Port Harcourt"],
    body: `
      <h2>The Heartbeat of Education in Rivers State</h2>
      <p>In every thriving school in Port Harcourt, there are educators who arrive before sunrise, spend personal resources on learning aids, and mentor struggling students through personal challenges. Yet, their commitment too often goes unnoticed in national public discourse.</p>

      <p>The Teachers Spotlight Awards was established to change this narrative. By inviting parents, alumni, colleagues, and school proprietors to nominate outstanding teachers, we provide a verified public stage where excellence is celebrated.</p>

      <blockquote>
        "When we celebrate a great teacher, we do not just give an award—we elevate the dignity of the entire teaching profession across our state."
      </blockquote>

      <h3>Join the Movement</h3>
      <p>Ahead of our flagship gathering on 21 November 2026 at the Celebrate Center, community nominations are opening to spotlight educators who demonstrate peerless pedagogy, integrity, and student impact.</p>
    `,
  },
  {
    title:
      "The Role of Accredited Professional Development in Teacher Retention",
    slug: "accredited-professional-development-teacher-retention",
    categorySlug: "teacher-school-leadership",
    excerpt:
      "Why the highest-performing private schools invest systematically in TRCN-accredited training rather than treating teacher learning as an occasional perk.",
    coverImage: "/images/ph_schools_map_banner.jpg",
    tags: [
      "Teacher Training",
      "GeePhill",
      "Professional Development",
      "Leadership",
    ],
    body: `
      <h2>Retention Through Empowerment</h2>
      <p>One of the most persistent complaints from school proprietors in Port Harcourt is the constant churn of quality teachers. Talented educators leave private schools not only for salary improvements, but when they feel intellectually stagnant and unsupported.</p>

      <p>Accredited continuing professional development (CPD) shifts the dynamic. When a school partners with recognized educational consultants to provide TRCN-recognized masterclasses, teachers see a clear path for career progression within the institution.</p>

      <h3>Key Outcomes of Institutional Training:</h3>
      <ul>
        <li>Measurable improvement in classroom management and learner outcomes.</li>
        <li>Standardized front-desk and parent communication protocols.</li>
        <li>Substantial reduction in mid-session teacher departures.</li>
      </ul>
    `,
  },
  {
    title: "Announcing The Teachers Spotlight Education Summit & Awards 2026",
    slug: "announcing-teachers-spotlight-summit-awards-2026",
    categorySlug: "events-announcements",
    excerpt:
      "Mark your calendars for 21 November 2026 at Celebrate Center, Olu Obasanjo Road, Port Harcourt. Honest conversations and honest recognition.",
    coverImage: "/images/ph_hero_classroom.jpg",
    tags: ["Summit 2026", "Awards", "Celebrate Center", "Announcements"],
    body: `
      <h2>Save the Date: 21 November 2026</h2>
      <p>PortHarcourtSchools and EdFocus Africa are proud to announce the date and venue for the 2026 edition of <strong>The Teachers Spotlight Education Summit &amp; Awards</strong>.</p>

      <p>Hosted at the prestigious <strong>Celebrate Center on Olu Obasanjo Road, Port Harcourt</strong>, this full-day gathering brings together over 400 school owners, policy leaders, teachers, and parent representatives for a transformative dialogue on Nigerian education.</p>

      <h3>Event Structure:</h3>
      <p><strong>Morning Summit:</strong> Keynote addresses and panel discussions on school sustainability, safeguarding benchmarks, and technological adaptation.</p>
      <p><strong>Afternoon Gala &amp; Awards:</strong> Official presentation of the 2026 Teachers Spotlight Awards honouring verified educators across Rivers State.</p>
    `,
  },
];

async function seedBlog() {
  console.log("📝 Starting Blog & Category Seed Script...");

  // 1. Seed Categories
  const categoryMap = new Map<string, string>();

  for (const cat of CATEGORIES) {
    const [existing] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, cat.slug))
      .limit(1);

    if (!existing) {
      const [inserted] = await db
        .insert(schema.categories)
        .values({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
        })
        .returning();
      categoryMap.set(cat.slug, inserted.id);
      console.log(`  + Inserted Category: ${cat.name}`);
    } else {
      categoryMap.set(cat.slug, existing.id);
      console.log(`  = Category already exists: ${cat.name}`);
    }
  }

  // 2. Fetch or assign author (Super Admin)
  const [adminUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.role, "super_admin"))
    .limit(1);

  const authorId = adminUser ? adminUser.id : null;

  // 3. Seed Sample Posts
  for (const post of SAMPLE_POSTS) {
    const [existingPost] = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.slug, post.slug))
      .limit(1);

    const categoryId = categoryMap.get(post.categorySlug);

    if (!existingPost) {
      await db.insert(schema.posts).values({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: post.body.trim(),
        coverImage: post.coverImage,
        categoryId: categoryId || null,
        tags: post.tags,
        authorId: authorId,
        status: "published",
        publishedAt: new Date(),
      });
      console.log(`  + Inserted Post: ${post.title}`);
    } else {
      console.log(`  = Post already exists: ${post.title}`);
    }
  }

  console.log("🎉 Blog categories and initial posts seeded successfully!");
}

seedBlog().catch((err) => {
  console.error("❌ Blog seed failed:", err);
  process.exit(1);
});
