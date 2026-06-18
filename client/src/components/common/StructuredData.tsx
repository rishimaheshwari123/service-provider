import { useEffect } from 'react';

interface StructuredDataProps {
  data: object;
}

const StructuredData = ({ data }: StructuredDataProps) => {
  useEffect(() => {
    // Create or update structured data script
    const scriptId = 'structured-data';
    let script = document.getElementById(scriptId);
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(data);
    
    return () => {
      // Cleanup on unmount
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [data]);

  return null;
};

export default StructuredData;

// Predefined structured data schemas

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mera Ghar Sansaar",
  "url": "https://www.meragharsansaar.com",
  "logo": "https://www.meragharsansaar.com/logo.png",
  "description": "Leading home construction, interior design, and renovation services provider in India",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  },
  "sameAs": [
    "https://www.facebook.com/meragharsansaar",
    "https://www.instagram.com/meragharsansaar",
    "https://www.linkedin.com/company/meragharsansaar",
    "https://twitter.com/meragharsansaar"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-XXXXXXXXXX",
    "contactType": "Customer Service",
    "availableLanguage": ["English", "Hindi"]
  }
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Mera Ghar Sansaar",
  "url": "https://www.meragharsansaar.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.meragharsansaar.com/services?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

export const generateArticleSchema = (article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mera Ghar Sansaar",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.meragharsansaar.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };
};

export const generateServiceSchema = (service: {
  name: string;
  description: string;
  image?: string;
  url: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": "Mera Ghar Sansaar",
      "url": "https://www.meragharsansaar.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "image": service.image,
    "url": service.url
  };
};

export const generateLocalBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Mera Ghar Sansaar",
  "image": "https://www.meragharsansaar.com/logo.png",
  "url": "https://www.meragharsansaar.com",
  "telephone": "+91-XXXXXXXXXX",
  "priceRange": "₹₹₹",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    }
  ]
};
