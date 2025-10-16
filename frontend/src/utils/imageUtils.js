// Utility functions for consistent image URL handling

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Convert image URL to use HTTPS and construct full URL if needed
 * @param {string} imageUrl - Image URL (can be relative or absolute)
 * @returns {string} - Properly formatted HTTPS URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "/default-avatar.png";
  
  // If it's already a full HTTP URL, convert to HTTPS
  if (imageUrl.startsWith("http://")) {
    return imageUrl.replace("http://", "https://");
  }
  
  // If it's already HTTPS, return as is
  if (imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  
  // If it's a relative path, construct full URL
  if (imageUrl.startsWith("/")) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // Default fallback
  return "/default-avatar.png";
};

/**
 * Get profile picture URL with fallback
 * @param {string} profilePicture - Profile picture path/URL
 * @returns {string} - Properly formatted profile picture URL
 */
export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture || profilePicture === "/images/default-avatar.svg") {
    return "/default-avatar.png";
  }
  
  return getImageUrl(profilePicture);
};

/**
 * Get post image URL
 * @param {string} imageUrl - Post image path/URL
 * @returns {string} - Properly formatted post image URL
 */
export const getPostImageUrl = (imageUrl) => {
  return getImageUrl(imageUrl);
};