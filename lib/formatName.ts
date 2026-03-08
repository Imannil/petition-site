/**
 * Format a full name for display as "Lastname, Firstname".
 * Edit this file to change how names are displayed in the signatures list.
 *
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
 * Extract last name for sorting: the last part (last word) of the user's fullName.
 * Same convention as display. Single-word names use the whole string; empty returns "".
 */
export function getLastNameForSort(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return (parts[parts.length - 1] ?? "").toLowerCase();
}
