import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ==========================================
// ENUMS (Single Source of Truth)
// ==========================================

export const roleEnum = pgEnum("role", [
  "super_admin",
  "admin",
  "editor",
  "creator",
]);

export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "in_review",
  "published",
  "archived",
]);

export const programmeStatusEnum = pgEnum("programme_status", [
  "draft",
  "published",
  "archived",
]);

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "in_review",
  "published",
  "archived",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "summit",
  "masterclass",
  "workshop",
  "awards",
]);

export const schoolTypeEnum = pgEnum("school_type", [
  "private",
  "public",
  "faith_based",
  "international",
]);

export const curriculumEnum = pgEnum("curriculum", [
  "nigerian",
  "british",
  "american",
  "ib",
  "mixed",
]);

export const genderEnum = pgEnum("gender", ["co_ed", "boys", "girls"]);

export const boardingTypeEnum = pgEnum("boarding_type", [
  "day",
  "boarding",
  "both",
]);

export const feePeriodEnum = pgEnum("fee_period", ["per_term", "per_session"]);

export const feeVisibilityEnum = pgEnum("fee_visibility", [
  "exact",
  "band_only",
  "on_request",
  "hidden",
]);

export const schoolStatusEnum = pgEnum("school_status", [
  "draft",
  "published",
  "archived",
]);

export const nominationStatusEnum = pgEnum("nomination_status", [
  "new",
  "reviewed",
  "shortlisted",
  "archived",
]);

export const personaTypeEnum = pgEnum("persona_type", [
  "parent",
  "teacher",
  "school",
  "partner",
  "other",
]);

export const contactStatusEnum = pgEnum("contact_status", [
  "new",
  "read",
  "archived",
]);

export const eventRegistrationStatusEnum = pgEnum("event_registration_status", [
  "confirmed",
  "pending_payment",
  "cancelled",
]);

// ==========================================
// USERS & AUTH.JS ADAPTER TABLES
// ==========================================

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: roleEnum("role").default("creator").notNull(),
  status: userStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [
    primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  ],
);

// ==========================================
// CONTENT & EDITABLE PAGES
// ==========================================

export const pages = pgTable("pages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  sections: jsonb("sections")
    .$type<Record<string, unknown> | Array<Record<string, unknown>>>()
    .default({}),
  seoMeta: jsonb("seo_meta").$type<{
    title?: string;
    description?: string;
    ogImage?: string;
  }>(),
  updatedBy: text("updated_by").references(() => users.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ==========================================
// BLOG & CATEGORIES
// ==========================================

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  body: text("body").notNull(),
  coverImage: text("cover_image"),
  categoryId: text("category_id").references(() => categories.id),
  tags: jsonb("tags").$type<string[]>().default([]),
  authorId: text("author_id").references(() => users.id),
  status: postStatusEnum("status").default("draft").notNull(),
  publishedAt: timestamp("published_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

// ==========================================
// PROGRAMMES & PARTNERS
// ==========================================

export const programmes = pgTable("programmes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  provider: text("provider").default("GeePhill").notNull(),
  category: text("category"),
  isAccredited: boolean("is_accredited").default(false).notNull(),
  coverImage: text("cover_image"),
  status: programmeStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const partners = pgTable("partners", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  tier: text("tier").default("partner").notNull(),
  website: text("website"),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ==========================================
// AREAS & SCHOOLS DIRECTORY
// ==========================================

export const areas = pgTable("areas", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  lga: text("lga").default("Port Harcourt").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const schools = pgTable("schools", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  levels: jsonb("levels").$type<string[]>().default([]).notNull(), // Nursery, Primary, Secondary
  schoolType: schoolTypeEnum("school_type").default("private").notNull(),
  curriculum: curriculumEnum("curriculum").default("nigerian").notNull(),
  gender: genderEnum("gender").default("co_ed").notNull(),
  boardingType: boardingTypeEnum("boarding_type").default("day").notNull(),
  address: text("address"),
  areaId: text("area_id").references(() => areas.id),
  lga: text("lga"),
  lat: numeric("lat"),
  lng: numeric("lng"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  website: text("website"),
  socials: jsonb("socials").$type<{
    instagram?: string;
    facebook?: string;
    x?: string;
    tiktok?: string;
  }>(),
  feeMin: integer("fee_min"), // Naira ₦
  feeMax: integer("fee_max"), // Naira ₦
  feePeriod: feePeriodEnum("fee_period").default("per_term").notNull(),
  feeVisibility: feeVisibilityEnum("fee_visibility")
    .default("band_only")
    .notNull(),
  logo: text("logo"),
  coverImage: text("cover_image"),
  gallery: jsonb("gallery").$type<string[]>().default([]),
  description: text("description"),
  verified: boolean("verified").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  status: schoolStatusEnum("status").default("draft").notNull(),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const areasRelations = relations(areas, ({ many }) => ({
  schools: many(schools),
}));

export const schoolsRelations = relations(schools, ({ one }) => ({
  area: one(areas, {
    fields: [schools.areaId],
    references: [areas.id],
  }),
  creator: one(users, {
    fields: [schools.createdBy],
    references: [users.id],
  }),
}));

// ==========================================
// EVENTS & PROGRAMMES
// ==========================================

export const events = pgTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }),
  venue: text("venue").notNull(),
  coverImage: text("cover_image"),
  type: eventTypeEnum("type").default("summit").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  price: integer("price").default(0), // Amount in Naira ₦
  paymentLink: text("payment_link"),
  status: eventStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  schoolName: text("school_name"),
  role: text("role").default("teacher").notNull(),
  ticketQuantity: integer("ticket_quantity").default(1).notNull(),
  totalAmount: integer("total_amount").default(0).notNull(),
  status: eventRegistrationStatusEnum("status")
    .default("pending_payment")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const eventsRelations = relations(events, ({ many }) => ({
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(
  eventRegistrations,
  ({ one }) => ({
    event: one(events, {
      fields: [eventRegistrations.eventId],
      references: [events.id],
    }),
  }),
);

// ==========================================
// LEAD CAPTURE: NOMINATIONS & SUBMISSIONS
// ==========================================

export const nominations = pgTable("nominations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  nomineeName: text("nominee_name").notNull(),
  nomineeSchool: text("nominee_school").notNull(),
  nominatorName: text("nominator_name").notNull(),
  nominatorEmail: text("nominator_email").notNull(),
  nominatorPhone: text("nominator_phone"),
  category: text("category").notNull(),
  reason: text("reason").notNull(),
  status: nominationStatusEnum("status").default("new").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  personaType: personaTypeEnum("persona_type").default("parent").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: contactStatusEnum("status").default("new").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ==========================================
// MEDIA LIBRARY
// ==========================================

export const media = pgTable("media", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  altText: text("alt_text"),
  uploadedBy: text("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ==========================================
// SITE SETTINGS & PAGES CMS
// ==========================================

export type ContactEmailItem = {
  id: string;
  label: string;
  email: string;
  isPrimary: boolean;
};

export type ContactPhoneItem = {
  id: string;
  label: string;
  number: string;
  isWhatsapp: boolean;
  isPrimary: boolean;
};

export type ContactAddressItem = {
  id: string;
  label: string;
  address: string;
  city?: string;
  state?: string;
  isPrimary: boolean;
};

export type SocialLinkItem = {
  id: string;
  platform: string;
  url: string;
  handle?: string;
};

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("default"),
  siteName: text("site_name").default("Port Harcourt Schools").notNull(),
  siteTagline: text("site_tagline").default(
    "The definitive educational resource for families and schools in Port Harcourt.",
  ),
  siteDescription: text("site_description").default(
    "Discover top-rated primary and secondary schools across Port Harcourt. Explore verified reviews, curriculum options, facilities, tuition estimates, and admission guidelines.",
  ),
  contactEmails: jsonb("contact_emails")
    .$type<ContactEmailItem[]>()
    .default([])
    .notNull(),
  contactPhones: jsonb("contact_phones")
    .$type<ContactPhoneItem[]>()
    .default([])
    .notNull(),
  contactAddresses: jsonb("contact_addresses")
    .$type<ContactAddressItem[]>()
    .default([])
    .notNull(),
  socialLinks: jsonb("social_links")
    .$type<SocialLinkItem[]>()
    .default([])
    .notNull(),
  defaultOgImage: text("default_og_image"),
  googleAnalyticsId: text("google_analytics_id"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Infer types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Area = typeof areas.$inferSelect;
export type NewArea = typeof areas.$inferInsert;
export type Partner = typeof partners.$inferSelect;
export type Programme = typeof programmes.$inferSelect;
export type Nomination = typeof nominations.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type MediaItem = typeof media.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
export type PageContent = typeof pages.$inferSelect;
export type NewPageContent = typeof pages.$inferInsert;
