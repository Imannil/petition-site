/**
 * Format a full name for display as "Lastname, Firstname".
 * Edit this file to change how names are displayed in the signatures list.
 *
 * Logic: last word = last name, everything before = first name(s).
 * Single-word names are returned as-is.
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
