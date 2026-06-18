/**
 * Utility functions for blog operations
 */

/**
 * Generate a URL-friendly slug from a title
 * @param {string} title - The blog title
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // Remove special characters except spaces, hyphens, and underscores
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces/underscores with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
};

/**
 * Validate if a slug is properly formatted
 * @param {string} slug - The slug to validate
 * @returns {boolean} - Whether the slug is valid
 */
export const isValidSlug = (slug) => {
  if (!slug) return false;
  
  // Check if slug contains only lowercase letters, numbers, and hyphens
  // Should not start or end with hyphen
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Create a unique slug by appending a number if needed
 * @param {string} baseSlug - The base slug
 * @param {Array} existingSlugs - Array of existing slugs to check against
 * @returns {string} - Unique slug
 */
export const createUniqueSlug = (baseSlug, existingSlugs = []) => {
  let uniqueSlug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};

/**
 * Extract reading time from content
 * @param {string} content - The blog content
 * @param {number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {string} - Reading time string
 */
export const calculateReadingTime = (content, wordsPerMinute = 200) => {
  if (!content) return '1 min read';
  
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format date for blog display
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatBlogDate = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString(undefined, options);
};