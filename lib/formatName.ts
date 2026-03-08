/**
 * Format a full name for display as "Lastname, Firstname".
 * Convention: the last part (last word) of the user's fullName is treated as last name;
 * everything before is first name(s). Single-word names are shown as-is.
 */
export function formatFullNameToLastFirst(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return trimmed;
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return trimmed;
  const lastName = parts[parts.length - 1] ?? "";
  const firstNames = parts.slice(0, -1).join(" ");
  return `${lastName}, ${firstNames}`;
}

/**
 * Build display name from firstName + lastName, or fall back to parsing fullName (legacy).
 * Use when you have optional firstName/lastName (e.g. from DB) and fullName.
 */
export function getDisplayName(
  fullName: string,
  firstName?: string | null,
  lastName?: string | null
): string {
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  if (first && last) return `${last}, ${first}`;
  return formatFullNameToLastFirst(fullName);
}

/**
 * Extract the last word of fullName (for sorting or backfill). Returns lowercase for consistent sort.
 */
export function getLastNameForSort(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return (parts[parts.length - 1] ?? "").toLowerCase();
}

/**
 * Extract all but the last word of fullName (for backfill of firstName from legacy fullName).
 */
export function getFirstNamesFromFullName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return trimmed;
  return parts.slice(0, -1).join(" ");
}

/**
 * Extract the last word of fullName preserving case (for backfill display).
 */
export function getLastWordFromFullName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? "";
}
