import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  article?: {
    publishedTime?: string;
    author?: string;
    section?: string;
  };
  noindex?: boolean;
}

const SEO = ({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  ogType = 'website',
  article,
  noindex = false
}: SEOProps) => {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Helper function to set or update meta tag
    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Helper function to set link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      
      element.href = href;
    };

    // Basic meta tags
    setMetaTag('description', description);
    if (keywords.length > 0) {
      setMetaTag('keywords', keywords.join(', '));
    }

    // Robots meta
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Canonical URL
    if (canonical) {
      setLinkTag('canonical', canonical);
    }

    // Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:site_name', 'Mera Ghar Sansaar', true);
    setMetaTag('og:locale', 'en_IN', true);
    
    if (canonical) {
      setMetaTag('og:url', canonical, true);
    }
    
    if (ogImage) {
      setMetaTag('og:image', ogImage, true);
      setMetaTag('og:image:alt', title, true);
      setMetaTag('og:image:width', '1200', true);
      setMetaTag('og:image:height', '630', true);
    }

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:site', '@MeraGharSansaar');
    
    if (ogImage) {
      setMetaTag('twitter:image', ogImage);
    }

    // Article specific tags
    if (article && ogType === 'article') {
      if (article.publishedTime) {
        setMetaTag('article:published_time', article.publishedTime, true);
      }
      if (article.author) {
        setMetaTag('article:author', article.author, true);
      }
      if (article.section) {
        setMetaTag('article:section', article.section, true);
      }
    }

    // Additional SEO tags
    setMetaTag('format-detection', 'telephone=no');
    setMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=5');
    
  }, [title, description, keywords, canonical, ogImage, ogType, article, noindex]);

  return null;
};

export default SEO;
