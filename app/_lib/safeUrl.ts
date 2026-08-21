// The backend already restricts instagramUrl/facebookUrl to http(s), but an
// <a href> shouldn't trust a string from an API response as a rendering
// contract — a `javascript:` URI would execute on click if it ever slipped
// through. Belt-and-suspenders: re-validate the scheme before rendering.
export const safeHttpUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
};
