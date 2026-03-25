import React from 'react';

/**
 * Utility functions for search functionality
 */

/**
 * Highlights search terms in text
 * @param text - The text to highlight
 * @param searchTerm - The search term to highlight
 * @returns JSX element with highlighted text
 */
export const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <span key={index} className="bg-yellow-200 font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
};

/**
 * Checks if a service matches the search criteria
 * @param service - The service object to check
 * @param searchTerm - The search term
 * @returns boolean indicating if the service matches
 */
export const matchesSearchTerm = (service: any, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  
  const term = searchTerm.toLowerCase().trim();
  
  // Search across all relevant fields
  const searchFields = [
    // Service fields
    service.title,
    service.description,
    service.location,
    service.state,
    service.city,
    service.zipcode,
    service.pincode,
    service.address,
    service.category?.name || service.category,
    // Vendor fields
    service.vendor?.name,
    service.vendor?.company,
    service.vendor?.address,
    service.vendor?.city,
    service.vendor?.state,
    service.vendor?.pincode,
    service.vendor?.zipcode,
    service.vendor?.location,
  ];
  
  return searchFields.some(field => 
    field && field.toLowerCase().includes(term)
  );
};

/**
 * Sorts services by search relevance
 * @param services - Array of services
 * @param searchTerm - The search term
 * @returns Sorted array of services
 */
export const sortByRelevance = (services: any[], searchTerm: string): any[] => {
  if (!searchTerm) return services;
  
  const term = searchTerm.toLowerCase().trim();
  
  return services.sort((a, b) => {
    // Priority scoring
    let scoreA = 0;
    let scoreB = 0;
    
    // Vendor name match gets highest priority
    if (a.vendor?.name?.toLowerCase().includes(term)) scoreA += 100;
    if (b.vendor?.name?.toLowerCase().includes(term)) scoreB += 100;
    
    // Title match gets high priority
    if (a.title?.toLowerCase().includes(term)) scoreA += 50;
    if (b.title?.toLowerCase().includes(term)) scoreB += 50;
    
    // Location matches get medium priority
    if (a.location?.toLowerCase().includes(term)) scoreA += 25;
    if (b.location?.toLowerCase().includes(term)) scoreB += 25;
    
    if (a.city?.toLowerCase().includes(term)) scoreA += 20;
    if (b.city?.toLowerCase().includes(term)) scoreB += 20;
    
    // Category match gets lower priority
    if (a.category?.toLowerCase().includes(term)) scoreA += 10;
    if (b.category?.toLowerCase().includes(term)) scoreB += 10;
    
    return scoreB - scoreA;
  });
};