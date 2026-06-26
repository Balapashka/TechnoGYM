/**
 * Content pages reachable from the header/footer. Every link in the site
 * resolves to one of these generic placeholder pages so nothing is a dead end.
 */
export type InfoContent = {
  title: string;
  lead: string;
  sections?: { heading: string; body: string }[];
};

export const infoPages: Record<string, InfoContent> = {
  wellness: {
    title: "Wellness",
    lead: "Our approach to training, recovery and a healthier daily routine.",
    sections: [
      {
        heading: "Move every day",
        body: "Generic placeholder copy about building sustainable habits with the right equipment.",
      },
      {
        heading: "Train smarter",
        body: "Generic placeholder copy about data-driven workouts and guided sessions.",
      },
    ],
  },
  design: {
    title: "Design",
    lead: "Equipment designed to fit your home as naturally as your routine.",
  },
  stories: {
    title: "Stories",
    lead: "Mock customer stories and editorial content for the demo.",
  },
  community: {
    title: "Community",
    lead: "Join a placeholder community of people training at home.",
  },
  business: {
    title: "For business",
    lead: "Solutions for gyms, hotels and corporate wellness (demo content).",
  },
  account: {
    title: "Your account",
    lead: "Demo account area. Sign in from the login page to see your details.",
  },
  contact: {
    title: "Contact",
    lead: "Reach our (fictional) team. This form is not connected to anything.",
  },
  "customer-support": {
    title: "Customer support",
    lead: "Help center placeholder with FAQs and guides.",
  },
  shipping: {
    title: "Shipping",
    lead: "How delivery would work in a real store (demo text).",
  },
  returns: {
    title: "Returns",
    lead: "Return policy placeholder for the demo store.",
  },
  about: {
    title: "About",
    lead: "Movigym is a fictional brand created for an educational demo.",
  },
  sustainability: {
    title: "Sustainability",
    lead: "Placeholder commitments to people and the planet.",
  },
  careers: {
    title: "Careers",
    lead: "Mock job board — no real positions are listed.",
  },
  press: {
    title: "Press",
    lead: "Press resources placeholder for the demo.",
  },
  privacy: {
    title: "Privacy policy",
    lead: "This demo does not collect personal data. Placeholder policy text.",
  },
  "cookie-policy": {
    title: "Cookie policy",
    lead: "The demo only stores your preferences locally. Placeholder text.",
  },
  terms: {
    title: "Terms & conditions",
    lead: "Placeholder terms for the educational demo.",
  },
  "sales-conditions": {
    title: "Sales conditions",
    lead: "Placeholder sales conditions. No real purchases are processed.",
  },
  social: {
    title: "Follow us",
    lead: "Social links are placeholders in this demo and do not point anywhere real.",
  },
};

export function getInfoPage(slug: string): InfoContent | null {
  return infoPages[slug] ?? null;
}

export const infoSlugs = Object.keys(infoPages);
