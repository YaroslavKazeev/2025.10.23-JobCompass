/**
 * Normalizes a URL by ensuring it has a proper protocol
 * @param {string} url - The URL to normalize
 * @returns {string} - The normalized URL with https:// protocol
 */
export default function normalizeUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
}
