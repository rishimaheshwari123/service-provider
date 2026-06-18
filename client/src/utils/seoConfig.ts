// SEO Configuration for all pages
const LOGO_URL = "https://www.meragharsansaar.com/logo.png";

export const seoConfig = {
  home: {
    title: "Mera Ghar Sansaar | Home Construction, Interior Design & Turnkey Solutions",
    description: "Build your dream home with Mera Ghar Sansaar. Expert home construction, interior design, architecture, renovation, modular kitchens, and turnkey home solutions across India.",
    keywords: [
      "Home Construction Services",
      "Interior Design Company",
      "Turnkey Interior Solutions",
      "Residential Construction",
      "Home Renovation Services",
      "Modular Kitchen Design",
      "House Construction Company",
      "Interior Designers Near Me",
      "Dream Home Construction",
      "Home Design Services"
    ],
    canonical: "https://www.meragharsansaar.com/",
    ogImage: LOGO_URL
  },
  
  about: {
    title: "About Mera Ghar Sansaar | Trusted Home Construction & Interior Experts",
    description: "Learn about Mera Ghar Sansaar, a trusted partner for home construction, architecture, interior design, and renovation services delivering quality and excellence.",
    keywords: [
      "About Interior Design Company",
      "Home Construction Experts",
      "Architecture Firm India",
      "Residential Interior Designers",
      "Turnkey Project Experts",
      "House Design Consultants",
      "Construction and Interior Company"
    ],
    canonical: "https://www.meragharsansaar.com/about",
    ogImage: LOGO_URL
  },
  
  services: {
    title: "Our Services | Construction, Interior Design & Renovation Solutions",
    description: "Explore professional home construction, interior design, architecture, renovation, modular kitchen, and turnkey project services from Mera Ghar Sansaar.",
    keywords: [
      "Interior Design Services",
      "Home Construction Services",
      "Turnkey Project Solutions",
      "House Renovation Services",
      "Architecture Services",
      "Residential Interior Design",
      "Modular Furniture Design",
      "Home Improvement Services"
    ],
    canonical: "https://www.meragharsansaar.com/services",
    ogImage: LOGO_URL
  },
  
  blogs: {
    title: "Mera Ghar Sansaar Blog | Home Services, Repair Tips & Local Service Updates",
    alternativeTitle: "Home Services Blog | Expert Tips, Repair Guides & Service Provider Insights",
    description: "Stay updated with expert home service tips, repair guides, healthcare insights, local business updates, and professional service trends from Mera Ghar Sansaar. Find useful advice to make everyday living easier.",
    keywords: [
      "Home Services Blog",
      "Home Maintenance Tips",
      "Repair Services Guide",
      "Local Service Providers",
      "Professional Home Services",
      "Home Improvement Tips",
      "Household Services",
      "Service Provider Directory",
      "Home Repair Solutions",
      "Healthcare Services Blog"
    ],
    canonical: "https://www.meragharsansaar.com/blogs",
    ogImage: LOGO_URL
  },
  
  contact: {
    title: "Careers at Mera Ghar Sansaar | Jobs, Service Provider & Partner Opportunities",
    description: "Join Mera Ghar Sansaar and explore exciting career opportunities. Find jobs, freelance projects, service provider registrations, and business partnership opportunities across multiple service categories.",
    keywords: [
      "Jobs Near Me",
      "Career Opportunities",
      "Service Provider Jobs",
      "Freelance Jobs India",
      "Home Service Jobs",
      "Technician Jobs",
      "Electrician Jobs",
      "Plumber Jobs"
    ],
    canonical: "https://www.meragharsansaar.com/contact",
    ogImage: LOGO_URL
  },
  
  customerSupport: {
    title: "Customer Support | 24/7 Help Center & Service Assistance | Mera Ghar Sansaar",
    description: "Need help with bookings, service requests, payments, or account issues? Contact Mera Ghar Sansaar customer support for quick assistance via phone, email, or live chat. Available 24/7.",
    keywords: [
      "Customer Support",
      "Help Center",
      "Service Support",
      "Online Customer Service",
      "Customer Care",
      "Service Assistance",
      "Support Team",
      "Booking Support",
      "Home Service Support",
      "Technical Support"
    ],
    canonical: "https://www.meragharsansaar.com/customer-support",
    ogImage: LOGO_URL
  },
  
  // Default values for dynamic pages
  default: {
    siteName: "Mera Ghar Sansaar",
    twitterHandle: "@MeraGharSansaar",
    locale: "en_IN",
    type: "website",
    image: LOGO_URL
  }
};

// Function to generate dynamic blog SEO
export const generateBlogSEO = (blog: {
  title: string;
  excerpt?: string;
  slug: string;
  image?: string;
  author?: string;
  publishedDate?: string;
}) => {
  return {
    title: `${blog.title} | Mera Ghar Sansaar Blog`,
    description: blog.excerpt || "Read the latest insights and tips on home services from Mera Ghar Sansaar.",
    canonical: `https://www.meragharsansaar.com/blogs/${blog.slug}`,
    ogImage: LOGO_URL, // Always use logo
    article: {
      publishedTime: blog.publishedDate,
      author: blog.author || "Mera Ghar Sansaar",
      section: "Home Services"
    }
  };
};

// Function to generate service detail SEO
export const generateServiceSEO = (service: {
  name: string;
  description?: string;
  slug: string;
  image?: string;
}) => {
  return {
    title: `${service.name} Services | Mera Ghar Sansaar`,
    description: service.description || `Professional ${service.name} services across India. Book expert service providers for your home needs.`,
    canonical: `https://www.meragharsansaar.com/services/${service.slug}`,
    ogImage: LOGO_URL // Always use logo
  };
};
