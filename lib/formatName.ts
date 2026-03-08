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
 * Capitalize the first letter of each word for display (e.g. "JOHN DOE" → "John Doe").
 */
function capitalizeForDisplay(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Build display name for the public signatures list.
 * Format: "Lastname, Firstname Middlename" — uses the full First Name (given name) including
 * middle names or compound first names. Never truncates to the first token.
 * When firstName/lastName are present, uses them in full; otherwise parses fullName (legacy).
 */
export function getDisplayName(
  fullName: string,
  firstName?: string | null,
  lastName?: string | null
): string {
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  if (first && last) {
    return `${capitalizeForDisplay(last)}, ${capitalizeForDisplay(first)}`;
  }
  const fromFull = formatFullNameToLastFirst(fullName);
  if (!fromFull) return fromFull;
  const commaIdx = fromFull.indexOf(", ");
  if (commaIdx === -1) return capitalizeForDisplay(fromFull);
  return `${capitalizeForDisplay(fromFull.slice(0, commaIdx))}, ${capitalizeForDisplay(fromFull.slice(commaIdx + 2))}`;
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
