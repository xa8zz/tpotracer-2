/**
 * Get a profile picture URL based on username
 * @param username The username
 * @returns URL to profile picture
 */
export const getProfilePicture = (username: string): string => {
  // Use a deterministic hash to get a seed for the profile picture
  const hash = hashString(username);
  
  // Use the hash to get a consistent color
  // We'll use this for a placeholder avatar with the first letter
  // This is a simple approach - in a real app you might use a proper avatar service
  
  // Get first letter of username
  const firstLetter = username.charAt(0).toUpperCase();
  
  // Get a gradient background color based on hash
  const hue = hash % 360; // 0-359 for hue
  const saturation = 70; // Percentage
  const lightness = 60; // Percentage
  
  // Create an SVG data URL with the user's initial and background color
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="hsl(${hue}, ${saturation}%, ${lightness}%)" />
      <text x="50" y="50" font-family="monospace" font-size="50" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">
        ${firstLetter}
      </text>
    </svg>
  `;
  
  // Convert SVG to data URL
  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  
  return dataUrl;
};

/**
 * Simple string hash function
 * @param str String to hash
 * @returns A number hash
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};