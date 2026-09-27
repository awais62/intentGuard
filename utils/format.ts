/**
 * Formatting helpers.
 *
 * NOTE (open decisions, see IntentSpec intent-dmi4q11h):
 * - Local time is used (Date#getDate/getMonth/getFullYear), not UTC.
 * - Unparseable input returns an empty string rather than throwing.
 * Both are pending developer confirmation and are easy to switch.
 */

/** Zero-pads a number to two digits. */
function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * Formats a date as `DD/MM/YYYY` with zero-padded day and month.
 *
 * @param value A `Date`, an ISO 8601 string, or epoch milliseconds.
 * @returns The date as `DD/MM/YYYY`, or `""` if `value` cannot be parsed.
 *
 * @example
 * formatDate(new Date(2024, 2, 5)); // "05/03/2024"
 * formatDate("2024-03-05T00:00:00.000Z"); // "05/03/2024"
 */
export function formatDate(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}
