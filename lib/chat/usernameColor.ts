/**
 * Generate a consistent color for a username.
 * Uses a hash-based approach to ensure the same username always gets the same color.
 */

const USERNAME_COLORS = [
  "#FF0000",
  "#0000FF",
  "#00FF00",
  "#B22222",
  "#FF7F50",
  "#9ACD32",
  "#FF4500",
  "#2E8B57",
  "#DAA520",
  "#D2691E",
  "#5F9EA0",
  "#1E90FF",
  "#FF69B4",
  "#8A2BE2",
  "#00FF7F",
];

export function getUsernameColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    // Constrain hash to 32-bit signed integer to avoid overflow/precision issues
    hash = (username.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  const index = (hash >>> 0) % USERNAME_COLORS.length;
  return USERNAME_COLORS[index];
}
