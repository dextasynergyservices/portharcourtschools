# Port Harcourt Schools (`portharcourtschools.com`)

The premier digital directory, educational intelligence portal, and community hub for schools, parents, educators, and institutional stakeholders across Port Harcourt, Rivers State, Nigeria.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.3-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1.18-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.1-C5F74F?style=flat&logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169e1?style=flat&logo=postgresql)](https://neon.tech/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-fbf0df?style=flat&logo=bun)](https://bun.sh/)
[![Biome](https://img.shields.io/badge/Linter-Biome_1.9-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)

---

## 🏫 Overview

**Port Harcourt Schools** is designed and built from the ground up to solve the fragmented educational discovery challenge in Rivers State. It connects parents seeking high-quality basic, primary, and secondary education with accredited schools, while providing school proprietors, educators, and education partners with a modern platform for visibility, admissions outreach, events, awards, and industry insights.

### Primary Audience
- **Parents & Guardians**: Compare tuition fees, curricula (British, Nigerian, Montessori, American, French, STEM), accreditation status, and facilities across Port Harcourt neighborhoods (Old GRA, Peter Odili, Woji, Trans-Amadi, GRA Phase 2, Ada George, etc.).
- **School Administrators**: Manage verified school listings, publish announcements, handle admissions inquiries, and showcase achievements.
- **Educators & Partners**: Participate in educational events (e.g., Teachers' Spotlight Summit), access development programmes, and engage with institutional initiatives.

---

## 🚀 Key Features

### 1. Public Experience
- **Interactive Schools Directory**:
  - Multi-criteria real-time filtering: Neighborhood/Area, School Category, Curriculum, Educational Level (Creche through SSS 3), and Tuition Fee Bands (₦).
  - Responsive mobile bottom sheet filter drawer and desktop sidebar with instant debounced search.
  - Verified badges and accreditation highlights.
- **Rich School Profiles**:
  - Hero branding, photo gallery, tuition fee bands, curriculum details, student capacity, facilities list, accreditation status, contact info, and direct admissions inquiry CTA.
- **Global Discovery Overlay**:
  - Full-screen search accessible from every page via header search trigger or keyboard shortcut. Quick-tag navigation for fast discovery.
- **Editorial & Insights (Blog)**:
  - Categorized articles (Admissions Guides, Curriculum Insights, School Spotlights, Parenting Tips, Policy & Regulations).
  - Fast pagination, responsive cards, rich markdown/HTML rendering, and reading time estimation.
- **Events & Programmes**:
  - Upcoming conferences, awards, and workshops with date badges, ticket tiers (Free / Paid), location maps, and automated Google Calendar integration.
  - Event registration workflow with automated confirmation email dispatch and Paystack checkout integration.
- **Partnership & Contact**:
  - Multi-persona contact inquiry forms (Parent, School Owner, Educator, Corporate Partner) protected by Cloudflare Turnstile anti-bot verification and automated Resend email alerts.
- **Mobile-First UX**:
  - App-like bottom tab navigation bar, slide-out drawer, scroll-aware transitions, and accessible skip-links.

### 2. Admin CMS Portal (`/admin`)
- **Security & RBAC**:
  - NextAuth.js v5 with secure HTTP-only session cookies and bcrypt password hashing.
  - Multi-role permission system: `superadmin` (full access & user management), `admin` (schools, blog, events, media, settings), and `editor` (content drafting & submissions).
- **Schools Directory Manager**:
  - Create, update, archive, and publish school profiles.
  - Featured and Verified toggles with instant multi-tier cache invalidation.
- **Articles & Content Publisher**:
  - Create and manage editorial articles with featured images, excerpts, category tags, author attribution, and SEO metadata.
- **Events & Registrations Hub**:
  - Schedule upcoming events, set venue details, configure registration fees, and view attendee lists.
- **Submissions & Leads Management**:
  - Review public contact inquiries and partnership leads with status pipelines (`New`, `In Review`, `Contacted`, `Resolved`).
- **Cloudflare R2 Media Gallery**:
  - S3-compatible asset uploader with file size validation, MIME checks, search, and image preview.
- **Site Settings & SEO**:
  - Update site title, tagline, description, official contact emails/phones, social media channels, and default OpenGraph images.

### 3. Performance, SEO & Caching
- **Two-Tier (L1 + L2) Cache Architecture**:
  - **Tier 1 (L1)**: Ultra-fast in-memory LRU cache (Node/Serverless) for 0ms repeat reads and hot bot crawls.
  - **Tier 2 (L2)**: Distributed Upstash Redis cache surviving cold starts with zero cross-region latency penalty.
  - **Zero Data Inconsistency Guarantee**: Admin mutations trigger atomic multi-tier cache tag invalidation (`invalidateCache([tag])`).
  - **Graceful Fallback**: Bypasses Redis seamlessly if credentials are absent, eliminating development blockers.
- **SEO & Schema.org JSON-LD**:
  - Dynamic `sitemap.xml` and `robots.txt` indexing public schools, blog articles, and upcoming events.
  - Validated JSON-LD microdata: `WebSite`, `EducationalOrganization`, `School`, `Article`, `Event`, and `ContactPage`.
  - Canonical URL tags and social OpenGraph / Twitter cards on all routes.
- **Accessibility**:
  - WCAG 2.1 AA certified with single `<main id="main-content">` landmark, skip-links, high-contrast palette (#FDDA32 Gold on #151B2E Navy at >11:1 ratio), and screen-reader labels.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [Base UI](https://base-ui.com/) primitives |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Database** | [Neon Serverless PostgreSQL](https://neon.tech/) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) + Drizzle Kit |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) (Credentials + JWT) |
| **Caching** | In-Memory L1 + [Upstash Redis](https://upstash.com/) L2 |
| **Media Storage** | [Cloudflare R2](https://www.cloudflare.com/products/r2/) (S3-Compatible Object Storage) |
| **Bot Protection** | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) |
| **Email Service** | [Resend](https://resend.com/) + React Email |
| **Linter & Formatter** | [Biome](https://biomejs.dev/) |
| **Unit Testing** | [Vitest](https://vitest.dev/) |
| **E2E Testing** | [Playwright](https://playwright.dev/) |
| **Package Manager** | [Bun](https://bun.sh/) |

---

## 📁 Directory Structure

```
portharcourtschools/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated GitHub Actions (Lint & Typecheck)
├── public/
│   ├── favicon.ico              # Platform favicon
│   └── images/
│       ├── logo.png             # Official brand logo
│       └── ...                  # Default static placeholders and banners
├── src/
│   ├── app/
│   │   ├── (admin)/             # Protected Admin CMS route group
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/   # Admin overview metrics
│   │   │   │   ├── schools/     # School management (CRUD + bulk actions)
│   │   │   │   ├── posts/       # Blog article publisher
│   │   │   │   ├── events/      # Events and attendee rosters
│   │   │   │   ├── media/       # Cloudflare R2 media library
│   │   │   │   ├── submissions/ # Contact form inquiries pipeline
│   │   │   │   ├── settings/    # Global platform settings
│   │   │   │   └── login/       # Admin credentials login
│   │   ├── (public)/            # Public visitor route group
│   │   │   ├── page.tsx         # Homepage (Hero, Spotlights, Events, News)
│   │   │   ├── schools/         # Schools directory & profile detail pages
│   │   │   ├── blog/            # Editorial index & article detail pages
│   │   │   ├── events/          # Events calendar & registration pages
│   │   │   ├── about/           # Mission, leadership, & community values
│   │   │   ├── contact/         # Inquiries, partnerships & feedback
│   │   │   └── partners/        # Institutional & corporate partnerships
│   │   ├── api/
│   │   │   ├── auth/            # NextAuth authentication endpoints
│   │   │   └── payments/        # Paystack webhook & transaction handlers
│   │   ├── layout.tsx           # Root layout with fonts, metadata, & shell
│   │   ├── robots.ts            # Dynamic robots.txt
│   │   └── sitemap.ts           # Dynamic XML sitemap generator
│   ├── components/
│   │   ├── admin/               # Admin CMS UI components & data tables
│   │   ├── site/                # Public UI components (headers, footers, cards)
│   │   └── ui/                  # Base design tokens (buttons, inputs, dialogs)
│   ├── emails/                  # React Email transactional templates
│   ├── lib/
│   │   ├── auth/                # NextAuth options, session helpers & password hashing
│   │   ├── db/                  # Drizzle database client & schema definitions
│   │   ├── validations/         # Zod schemas for schools, posts, events, contact
│   │   ├── cache.ts             # Two-Tier L1/L2 caching engine
│   │   ├── redis.ts             # Upstash Redis client with graceful fallback
│   │   ├── r2.ts                # Cloudflare R2 S3 storage client
│   │   ├── email.ts             # Resend transactional email client
│   │   ├── permissions.ts       # Role-Based Access Control logic
│   │   └── turnstile.ts         # Cloudflare Turnstile token verification
│   └── types/                   # Platform TypeScript type definitions
├── tests/
│   ├── unit/                    # Vitest unit tests (schemas, utils, RBAC)
│   ├── integration/             # Vitest server action integration tests
│   └── e2e/                     # Playwright cross-browser/device end-to-end tests
├── drizzle.config.ts            # Drizzle ORM configuration
├── next.config.ts               # Next.js 16 configuration (AVIF, headers)
├── playwright.config.ts         # Playwright multi-device test configuration
├── vitest.config.mts            # Vitest unit & integration test configuration
└── package.json                 # Project dependencies and script runner
```

---

## ⚙️ Getting Started

### Prerequisites
- [Bun Runtime](https://bun.sh/) (v1.1+ recommended)
- [Node.js](https://nodejs.org/) (v20+ LTS)
- A [Neon PostgreSQL](https://neon.tech/) database instance (or local PostgreSQL)

### 1. Clone the Repository
```bash
git clone https://github.com/dextasynergyservices/portharcourtschools.git
cd portharcourtschools
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Environment Variables Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure the required environment variables

# Database (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# NextAuth v5 Configuration
NEXTAUTH_SECRET="generate-a-secure-32-byte-hex-secret-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Upstash Redis (Optional for local development, recommended for production)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Cloudflare R2 Media Storage
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="portharcourtschools-media"
R2_PUBLIC_DOMAIN="media.portharcourtschools.com"

# Cloudflare Turnstile (Anti-Bot)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"

# Resend Transactional Email
RESEND_API_KEY="re_sample_api_key"
EMAIL_FROM="Port Harcourt Schools <notifications@portharcourtschools.com>"
ADMIN_EMAIL="admin@portharcourtschools.com"
```

### 4. Database Setup & Migrations
Push schema tables to your PostgreSQL database:
```bash
bun run db:push
```

*(Optional)* Seed sample schools, blog articles, and events:
```bash
bun run db:seed:schools
bun run db:seed:blog
bun run db:seed:events
```

### 5. Run the Local Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The Admin Portal is located at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `bun run dev` | Starts Next.js development server with Turbopack |
| `bun run lint` | Runs Biome linter and formatter |
| `bun run typecheck` | Runs strict TypeScript compiler check (`tsc --noEmit`) |
| `bun run check` | Runs full Biome check and TypeScript validation |
| `bun run test` | Runs Vitest unit and integration test suites |
| `bun run test:watch` | Runs Vitest in watch mode |
| `bun run test:e2e` | Runs Playwright E2E tests across Desktop and Mobile targets |
| `bun run db:generate` | Generates Drizzle migration files |
| `bun run db:push` | Synchronizes database schema directly with database |
| `bun run db:studio` | Launches visual Drizzle Studio database manager |

---

## 🧪 Testing & Quality Assurance

The codebase includes automated tests:
1. **Unit Tests (`tests/unit/`)**:
   - Zod validation schemas for schools, blog posts, events, and contact submissions.
   - Utility functions: Two-Tier Cache (L1 LRU + Redis), Google Calendar URL generator.
   - Role-Based Access Control (RBAC) permission logic.
2. **Integration Tests (`tests/integration/`)**:
   - Contact form server action (Turnstile verification → DB insertion → Resend notification email).
   - Event registration server action (Free event flow with calendar link vs. Paid flow with Paystack).
3. **End-to-End Tests (`tests/e2e/`)**:
   - Critical user flows: admin login, contact inquiry submission, directory filter interactions, and mobile navigation responsive drawers.

Run the unit and integration suite:
```bash
bun run test
```

Run end-to-end browser tests:
```bash
bun run test:e2e
```

---

## 🚢 Deployment Architecture

- **Web Application & Edge Rendering**: [Vercel](https://vercel.com/) (Node.js runtime, automatic preview deployments, global Edge network).
- **Database**: [Neon](https://neon.tech/) Serverless PostgreSQL (auto-scaling compute, connection pooling, branchable databases).
- **Object Storage**: [Cloudflare R2](https://www.cloudflare.com/products/r2/) (Zero egress fee media storage for school photos, banners, and logos).
- **Caching**: [Upstash Redis](https://upstash.com/) (Serverless low-latency global cache with automated TTL).
- **Domain & DNS**: Cloudflare SSL / DNS routing with custom CNAME for R2 media assets.

---

## 📄 License & Ownership

Copyright © 2026 **Port Harcourt Schools** & **Dexta Synergy Services**. All rights reserved.  
Unauthorized distribution, copying, or modification is strictly prohibited.
