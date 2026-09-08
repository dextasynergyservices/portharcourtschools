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
      "Main landing page hero, tuition banner, spotlights, and community invitation.",
    path: "/",
    defaultSections: {
      hero: {
        badge: "The Port Harcourt Education Hub",
        title:
          "Discover, Compare, and Connect with Top Schools in Port Harcourt.",
        subtitle:
          "Everything parents and educators need to make confident choices — verified listings, curriculum guides, tuition estimates, and honest community insights.",
        primaryCtaLabel: "Explore School Directory",
        primaryCtaLink: "/schools",
        secondaryCtaLabel: "Upcoming Events",
        secondaryCtaLink: "/events",
        coverImage: "",
        coverImageAlt: "Port Harcourt students in modern classroom",
      },
      tuitionBanner: {
        badge: "Transparency",
        headline: "Tuition Transparency in Rivers State",
        body: "Browse schools by tuition ranges, curriculum type, and boarding options with zero hidden fees.",
        buttonText: "Compare Tuition Ranges",
        buttonLink: "/schools",
      },
      spotlight: {
        badge: "Educator Excellence",
        title: "Classroom Champions & Teachers Spotlight",
        description:
          "Celebrating extraordinary educators shaping the future of young minds across Port Harcourt.",
        linkText: "View Spotlight Stories",
        linkUrl: "/blog",
      },
      community: {
        title: "Join the Port Harcourt Schools Community",
        subtitle:
          "Receive verified school admission updates, scholarship alerts, and educational summit announcements straight to your inbox.",
        ctaLabel: "Get In Touch",
        ctaLink: "/contact",
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
      "Mission, vision, core pillars, background story, and organisation leadership.",
    path: "/about",
    defaultSections: {
      hero: {
        badge: "Inquiries & Engagement",
        title: "The Education Media & Community Platform of EdFocus Africa.",
        subtitle:
          "Built to close the information and support gap between schools, parents and the education system across Rivers State.",
        coverImage: "",
        coverImageAlt: "EdFocus Africa education team",
      },
      mission: {
        title: "The Mission",
        description:
          "To provide parents with trusted, objective information to make informed educational choices for their children, while giving schools a credible platform to tell their stories and educators the recognition they deserve.",
      },
      vision: {
        title: "The Vision",
        description:
          "A connected education ecosystem in Rivers State and West Africa where quality schooling is accessible, transparent, and celebrated across all communities.",
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

  partners: {
    slug: "partners",
    title: "Partners & Sponsors",
    description:
      "Partnership tiers, sponsorship benefits, and institutional collaboration.",
    path: "/partners",
    defaultSections: {
      hero: {
        badge: "Collaboration & Impact",
        title: "Partner With PortHarcourtSchools",
        subtitle:
          "Reach over 50,000 parents, school leaders, and education influencers in Port Harcourt and across Rivers State.",
        ctaLabel: "Become a Partner",
        ctaLink: "/contact",
        coverImage: "",
        coverImageAlt: "Educational summit partners networking",
      },
      valueProp: {
        title: "Why Partner With Us",
        description:
          "Align your brand with educational advancement, gain direct visibility among key decision-makers, and support teacher development across Rivers State.",
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
      "Events directory header, flagship summit teaser, and attendee guidance.",
    path: "/events",
    defaultSections: {
      hero: {
        badge: "Professional Development & Community",
        title: "Education Events & Summits in Port Harcourt",
        subtitle:
          "Conferences, teacher masterclasses, leadership workshops, and student awards shaping the educational landscape.",
        coverImage: "",
        coverImageAlt: "Port Harcourt education summit audience",
      },
      summitSpotlight: {
        badge: "Flagship Gathering",
        title: "Annual Rivers State Education Leaders Summit",
        description:
          "Bringing together school proprietors, principals, policymakers, and PTA chairs to chart the future of basic and secondary schooling.",
      },
    },
    defaultSeo: {
      title: "Education Events & Summits — PortHarcourtSchools",
      description:
        "Explore conferences, workshops, and teacher training events in Port Harcourt, Rivers State.",
    },
  },
};
