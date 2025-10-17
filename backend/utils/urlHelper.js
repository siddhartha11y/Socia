// Utility functions for consistent URL handling

/**
 * Get the correct base URL for the current environment
 * @param {Object} req - Express request object
 * @returns {string} - Base URL with correct protocol
 */
export const getBaseUrl = (req) => {
  // Force HTTPS in production or when host is render.com
  const host = req.get('host');
  const isProduction = process.env.NODE_ENV === 'production' || host.includes('render.com');
  
  // Ensure protocol has proper format
  let protocol = isProduction ? 'https' : (req.protocol || 'http');
  
  // Remove any trailing colons or slashes from protocol
  protocol = protocol.replace(/[:\/]+$/, '');
  
  return `${protocol}://${host}`;
};

/**
 * Construct full URL for uploaded files
 * @param {Object} req - Express request object
 * @param {string} filePath - Relative file path (e.g., '/images/uploads/file.jpg')
 * @returns {string|null} - Full URL or null if no file path
 */
export const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  
  // If already a full URL, ensure it uses HTTPS in production
  if (filePath.startsWith('http')) {
    return process.env.NODE_ENV === 'production' 
      ? filePath.replace('http://', 'https://') 
      : filePath;
  }
  
  // Construct full URL
  return `${getBaseUrl(req)}${filePath}`;
};

/**
 * Format user object with correct profile picture URL
 * @param {Object} req - Express request object
 * @param {Object} user - User object
 * @returns {Object} - User object with formatted profile picture URL
 */
export const formatUserWithUrls = (req, user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  
  return {
    ...userObj,
    profilePicture: getFileUrl(req, userObj.profilePicture)
  };
};

/**
 * Format post object with correct image URLs
 * @param {Object} req - Express request object
 * @param {Object} post - Post object
 * @returns {Object} - Post object with formatted image URLs
 */
export const formatPostWithUrls = (req, post) => {
  if (!post) return null;
  
  const postObj = post.toObject ? post.toObject() : post;
  
  return {
    ...postObj,
    imageUrl: getFileUrl(req, postObj.imageUrl),
    author: postObj.author ? formatUserWithUrls(req, postObj.author) : null
  };
};

/**
 * Get profile picture URL with proper formatting
 * @param {Object} req - Express request object
 * @param {string} profilePicture - Profile picture path
 * @returns {string|null} - Full URL or null
 */
export const getProfilePictureUrl = (req, profilePicture) => {
  if (!profilePicture) return null;
  
  // If already a full URL, ensure proper format
  if (profilePicture.startsWith('http')) {
    // Ensure it has proper protocol format
    if (!profilePicture.includes('://')) {
      profilePicture = profilePicture.replace(/^https?/, '$&://');
    }
    // Force HTTPS in production
    return process.env.NODE_ENV === 'production' || profilePicture.includes('render.com')
      ? profilePicture.replace(/^http:/, 'https:')
      : profilePicture;
  }
  
  // Construct full URL
  return getFileUrl(req, profilePicture);
};