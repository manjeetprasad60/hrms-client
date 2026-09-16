/**
 * Utility to conditionally concatenate class names
 */

export type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | undefined
  | null
  | { readonly [key: string]: boolean | undefined | null };

export function cn(...inputs: readonly ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}
