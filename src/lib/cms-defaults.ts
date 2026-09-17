export interface PageConfig {
  slug: string;
  title: string;
  description: string;
  path: string;
  defaultSections: Record<string, unknown>;
  defaultSeo: {
    title: string;
    description: string;
    ogImage?: string;
  };
}

export const CMS_PAGES_CONFIG: Record<string, PageConfig> = {
  home: {
    slug: "home",
    title: "Home Page",
    description:
      "Hero statement, Founder teaser, editorial news framing, events teaser, schools directory callout, newsletter, and closing invitation.",
    path: "/",
    defaultSections: {
      hero: {
        badge: "Independent Educational Resource & Policy Forum",
        headlinePart1: "Clarity for Parents.",
        headlinePart2: "Growth for Schools.",
        headlinePart3: "Voice for Teachers.",
        subtitle:
          "PortHarcourtSchools is the media, programmes and community platform building a stronger education ecosystem across Port Harcourt and beyond, one school, one teacher, one parent at a time.",
        primaryCtaLabel: "Explore School Directory",
        primaryCtaLink: "/schools",
        secondaryCtaLabel: "Upcoming Events",
        secondaryCtaLink: "/events",
        coverImage: "/images/ph_hero_classroom.jpg",
        coverImageAlt: "Port Harcourt Classroom & Educators",
      },
      founderTeaser: {
        badge: "Meet the Founder",
        title: "A Vision for Education in Port Harcourt",
        quote:
          "When we improve the people, systems and conversations around education, we improve the future of our children.",
        author: "Dr. Grace Phillips-Ayonuwe",
        role: "Founder, Port Harcourt Schools & GeePhill Education",
        bio: "Dr. Grace Phillips-Ayonuwe is an education strategist, consultant, teacher educator, content creator and entrepreneur passionate about improving the quality of education in Nigeria. With a PhD in Educational Administration/Management, she founded Port Harcourt Schools to connect families, celebrate educators through the Teachers Spotlight Awards & Summit, and build a trusted education ecosystem across Port Harcourt and beyond.",
        image: "/images/dr-grace-phillips-ayonuwe.jpg",
        imageAlt:
          "Dr. Grace Phillips-Ayonuwe — Founder of Port Harcourt Schools",
        ctaLabel: "Read Full Profile & Vision",
        ctaLink: "/about#founder",
      },
      recentlyPublished: {
        badge: "Editorial Desk",
        title: "Recently Published",
        subtitle:
          "Stories, insights and clarity from inside Port Harcourt’s schools, curriculum changes, and classroom best practices.",
        ctaLabel: "More Publications",
        ctaLink: "/blog",
      },
      featuredEvents: {
        badge: "Upcoming Events",
        title: "Events & Summits",
        ctaLabel: "All Events",
        ctaLink: "/events",
      },
      partnersMarquee: {
        badge: "Ecosystem Network",
        title:
          "Trusted by Institutions & Education Leaders Across Rivers State",
      },
      directoryBanner: {
        title: "Explore Verified Schools Across Port Harcourt",
        subtitle:
          "Search accredited Montessori, nursery, primary, and secondary institutions across Old GRA, Peter Odili, Woji, Ada George, and Greater Port Harcourt.",
        ctaLabel: "Launch Schools Directory",
        ctaLink: "/schools",
        coverImage: "/images/ph_schools_map_banner.jpg",
        coverImageAlt: "Port Harcourt Schools Campus",
      },
      newsletter: {
        badge: "Weekly Digest",
        title: "Stay Informed on Port Harcourt Education",
        subtitle:
          "Weekly insights on school admissions, curriculum changes, safeguarding standards and educator excellence in Rivers State.",
      },
      focusAreas: {
        badge: "Focus Areas",
        title: "Where We Do the Work",
        subtitle:
          "Six targeted practice areas addressing the most critical needs across Rivers State schools.",
      },
      closingCta: {
        badge: "Community Invitation",
        title: "There’s a Place for You Here.",
        subtitle:
          "Whether you’re a parent seeking clarity, a teacher looking to sharpen your craft, or a school ready to share your story—PortHarcourtSchools is built for you.",
        primaryCtaLabel: "Explore School Directory",
        primaryCtaLink: "/schools",
        secondaryCtaLabel: "Get In Touch",
        secondaryCtaLink: "/contact",
      },
    },
    defaultSeo: {
      title:
        "PortHarcourtSchools — Port Harcourt's Definitive Education Directory & Community",
      description:
        "Discover top schools, view tuition ranges, explore curriculum choices, and connect with education leaders in Port Harcourt.",
    },
  },

  about: {
    slug: "about",
    title: "About Us",
    description:
      "Mission, vision, core audiences, strategic pillars, Founder profile & letter, and platform story.",
    path: "/about",
    defaultSections: {
      hero: {
        badge: "EdFocus Africa Platform",
        title: "Who We Are",
        subtitle:
          "PortHarcourtSchools is the education media and community platform of EdFocus Africa, built to close the information and support gap between schools, parents and the education system meant to serve them.",
        narrative:
          "We started as a content page documenting school life across Port Harcourt. Today, we’ve grown into a platform that combines media, structured programmes and public recognition, all working toward the same goal: an education ecosystem where good schools and good teachers are visible, supported and celebrated.",
      },
      mission: {
        title: "Our Mission",
        description:
          "To provide parents with trusted, objective information to make informed educational choices for their children, while giving schools a credible platform to tell their stories and educators the recognition they deserve.",
      },
      vision: {
        title: "Our Vision",
        description:
          "An education community where every parent can make an informed choice, every teacher has a path to grow, and every school has a clear standard to aim for, starting in Port Harcourt and expanding across Nigeria and Africa.",
      },
      founder: {
        badge: "Office of the Founder",
        title: "Meet the Founder",
        subtitle:
          "Education strategist, consultant, researcher, and convener of the Teachers Spotlight Awards & Summit.",
        author: "Dr. Grace Phillips-Ayonuwe",
        role: "Founder, Port Harcourt Schools & GeePhill Education",
        quote:
          "When we improve the people, systems and conversations around education, we improve the future of our children.",
        image: "/images/dr-grace-phillips-ayonuwe.jpg",
        imageAlt:
          "Dr. Grace Phillips-Ayonuwe — Founder of Port Harcourt Schools",
        letterTitle: "Building a Trusted Education Ecosystem",
        letterParagraph1:
          "Dr. Grace Phillips-Ayonuwe is an education strategist, consultant, teacher educator, content creator and entrepreneur passionate about improving the quality of education in Nigeria. She is the Founder of Port Harcourt Schools, an education media and information platform created to connect parents, schools, teachers and education stakeholders while making reliable information about schools, education opportunities and events more accessible to families in Port Harcourt and beyond.",
        letterParagraph2:
          "With a PhD in Educational Administration/Management, Dr. Grace brings together academic knowledge, practical school experience, teacher development and education communication in her work across the education sector.",
        letterParagraph3:
          "She is also the Founder and Director of GeePhill Education, an education consultancy providing services including school consulting, teacher training, curriculum development, recruitment and education marketing. Through her work with schools and educators, she focuses on strengthening teaching practice, school leadership, systems and sustainable school growth.",
        letterParagraph4:
          "Dr. Grace is also the convener of the Teachers Spotlight Awards & Summit (TSA), an initiative created to recognise, celebrate and equip educators while creating a platform for conversations around the future of education. Through Port Harcourt Schools, her vision is to build a trusted education ecosystem where parents can discover schools, schools can tell their stories, educators can access opportunities and the wider education community can stay informed about what is happening across Port Harcourt.\n\nHer work is driven by a simple belief: when we improve the people, systems and conversations around education, we improve the future of our children.",
      },
      whoWeServe: {
        badge: "One Platform • Three Audiences",
        title: "Who We Serve",
        subtitle:
          "Building a stronger education ecosystem across Port Harcourt and beyond, one school, one teacher, one parent at a time.",
      },
      whatWeDo: {
        badge: "Strategic Framework",
        title: "What We Do (Three Pillars)",
        subtitle:
          "Three pillars of work designed to lift standards across Port Harcourt education.",
      },
      methodology: {
        badge: "Implementation Methodology",
        title: "How We Execute",
        subtitle:
          "Structured approaches designed to Inform, Equip, Celebrate, and Connect.",
      },
      ourStory: {
        badge: "From Content to Institution",
        title: "Our Story",
        narrative:
          "PortHarcourtSchools grew out of years of hands-on work with schools across Rivers State, training teachers, advising school leaders, and watching firsthand how much good work goes unseen. What began as a media page became a platform built to change that, starting with the people already doing the work: teachers, school leaders and the parents trusting them with their children.",
        primaryCtaLabel: "Explore Programmes",
        primaryCtaLink: "/events#programmes",
        secondaryCtaLabel: "Join the Community",
        secondaryCtaLink: "https://instagram.com/portharcourtschools",
      },
      leadershipQuote: {
        quote:
          "Education does not improve in isolation. When parents are informed, schools are accountable, and teachers are valued, the entire community thrives.",
        author: "Alison GeePhill",
        role: "Founder & Lead Consultant, EdFocus Africa",
      },
    },
    defaultSeo: {
      title: "About Us — PortHarcourtSchools | EdFocus Africa",
      description:
        "PortHarcourtSchools is the education media and community platform of EdFocus Africa, built to close the information and support gap in Port Harcourt.",
    },
  },

  partners: {
    slug: "partners",
    title: "Partners & Sponsors",
    description:
      "Partnership hero header, value propositions, collaboration tiers, and institutional partnership inquiries.",
    path: "/partners",
    defaultSections: {
      hero: {
        badge: "Strategic Collaboration",
        title: "Education Grows Faster When the Right People Invest in It.",
        subtitle:
          "PortHarcourtSchools collaborates with forward-thinking organisations, brands, foundations, and education advocates to build high-impact programmes and expand access to quality schooling across Rivers State.",
      },
      valueProp: {
        badge: "Strategic Value",
        title: "Why Partner With Us",
        subtitle:
          "Our direct reach into Port Harcourt's school ecosystem connects your brand or CSR initiative directly with verified educators and active families.",
        point1:
          "Direct access to an engaged community of parents, teachers and school leaders",
        point2:
          "Visibility at flagship events like the Teachers Spotlight Education Summit & Awards",
        point3:
          "Association with a credible, established platform working in education since 2018",
        point4:
          "Opportunities to reach schools and educators through content, training and events",
      },
      partnershipCta: {
        title: "Ready to Explore Collaboration?",
        subtitle:
          "We welcome conversations with CSR sponsors, education technology providers, academic institutions, and brands dedicated to educational advancement in Rivers State.",
        ctaLabel: "Contact Partnerships Team",
        ctaLink: "/contact",
      },
    },
    defaultSeo: {
      title: "Partners & Sponsors — PortHarcourtSchools",
      description:
        "Partner with PortHarcourtSchools to reach educators, parents, and school leaders across Rivers State.",
    },
  },

  events: {
    slug: "events",
    title: "Events & Summit Hub",
    description:
      "Events directory header, upcoming events framing, and training programmes introductory copy.",
    path: "/events",
    defaultSections: {
      hero: {
        badge: "Public Engagement & Training",
        title: "Events & Programmes",
        subtitle:
          "From our flagship education summit to ongoing professional development masterclasses, this is where PortHarcourtSchools convenes, honors, and equips educators across Rivers State.",
      },
      upcomingHeader: {
        badge: "Calendar & Gatherings",
        title: "Upcoming Events & Workshops",
      },
      programmesHeader: {
        badge: "Accredited Training",
        title: "Ongoing Programmes & Masterclasses",
        subtitle:
          "Professional capacity building and specialized learning cohorts delivered through GeePhill Education Consulting.",
      },
    },
    defaultSeo: {
      title: "Education Events & Summits — PortHarcourtSchools",
      description:
        "Explore conferences, workshops, and teacher training events in Port Harcourt, Rivers State.",
    },
  },

  schools: {
    slug: "schools",
    title: "Schools Directory",
    description:
      "Directory hero title, garden city index badge, and search guidance copy.",
    path: "/schools",
    defaultSections: {
      hero: {
        badge: "Garden City Education Index",
        title: "Port Harcourt Schools Directory",
        subtitle:
          "Find, compare, and connect with accredited nursery, primary, and secondary institutions across Port Harcourt. Explore transparent tuition ranges in Naira, academic curriculums, and campus facilities.",
      },
    },
    defaultSeo: {
      title:
        "Schools Directory — Find Top Primary & Secondary Schools in Port Harcourt",
      description:
        "Explore accredited private, international, faith-based, and public schools across Port Harcourt. Compare tuition fees in Naira, curriculum, levels, and admissions.",
    },
  },

  contact: {
    slug: "contact",
    title: "Contact Us",
    description:
      "Header copy, direct contact channel instructions, and inquiry notes.",
    path: "/contact",
    defaultSections: {
      hero: {
        badge: "Inquiries & Engagement",
        title: "Let’s Talk.",
        subtitle:
          "Whether you’re a parent with a question, a teacher looking to get involved, a school interested in our programmes, or an organisation exploring partnership, we’d like to hear from you.",
      },
      directContact: {
        heading: "Direct Contact",
        body: "Our team typically responds to all inquiries within 24 to 48 business hours.",
        officeHours: "Monday – Friday: 9:00 AM – 5:00 PM (WAT)",
      },
    },
    defaultSeo: {
      title: "Contact Us — PortHarcourtSchools",
      description:
        "Get in touch with the PortHarcourtSchools team for questions, partnerships, or school directory inquiries.",
    },
  },

  research: {
    slug: "research",
    title: "Research & Focus Areas",
    description:
      "Manage strategic focus tracks, early years diagnostics, primary benchmarks, STEM pathways, and teacher leadership.",
    path: "/research",
    defaultSections: {
      hero: {
        badge: "Strategic Themes & Research",
        title: "Research & Focus Areas",
        subtitle:
          "Targeted developmental tracks guiding foundational literacy, secondary STEM pathways, and teacher leadership across Port Harcourt.",
      },
      track1: {
        number: "01",
        title: "Nursery & Early Years",
        subtitle:
          "Montessori, phonics foundations, and developmental diagnostics",
        href: "/schools?level=nursery",
        tag: "Ages 1–5",
        color: "#184098",
        bgImage: "/images/ph_schools_map_banner.jpg",
      },
      track2: {
        number: "02",
        title: "Primary Education Foundations",
        subtitle:
          "Literacy benchmarks, numeracy standards, and WAEC entry prep",
        href: "/schools?level=primary",
        tag: "Grades 1–6",
        color: "#08276B",
        bgImage: "/images/ph_hero_classroom.jpg",
      },
      track3: {
        number: "03",
        title: "Secondary & College Prep",
        subtitle: "WAEC, IGCSE, Cambridge, and international STEM pathways",
        href: "/schools?level=secondary",
        tag: "JSS1–SSS3",
        color: "#151B2E",
        bgImage: "/images/ph_schools_map_banner.jpg",
      },
      track4: {
        number: "04",
        title: "STEM, Robotics & Digital Literacy",
        subtitle:
          "Coding curriculum, science laboratories, and innovation clubs",
        href: "/blog?category=stem",
        tag: "Innovation",
        color: "#184098",
        bgImage: "/images/ph_hero_classroom.jpg",
      },
      track5: {
        number: "05",
        title: "Teachers Spotlight Awards & Summit",
        subtitle:
          "Accredited recognition, public honour, and annual state-wide forum",
        href: "/events",
        tag: "Flagship",
        color: "#9A7B0C",
        bgImage: "/images/classroom_champions_emblem.jpg",
      },
      track6: {
        number: "06",
        title: "School Leadership & Institutional Governance",
        subtitle:
          "Proprietor advisory, teacher retention, and financial resilience",
        href: "/blog?category=leadership",
        tag: "Leadership",
        color: "#08276B",
        bgImage: "/images/ph_schools_map_banner.jpg",
      },
      closingCta: {
        badge: "Collaborate With Us",
        title: "Have research, curriculum data or insights to share?",
        subtitle:
          "We partner with researchers, education non-profits, and policy advocates.",
        primaryCtaLabel: "Partner On Research",
        primaryCtaLink: "/contact?type=partner",
      },
    },
    defaultSeo: {
      title: "Research & Focus Areas — PortHarcourtSchools",
      description:
        "Explore our research and strategic focus areas shaping early years, primary, secondary, STEM, and teacher leadership in Port Harcourt.",
      ogImage: "/images/ph_hero_classroom.jpg",
    },
  },
};
