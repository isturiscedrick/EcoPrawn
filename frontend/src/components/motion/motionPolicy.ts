/** Shared motion preference queries. Kept dependency-free so dashboard code
 * does not pull public-page animation plugins into its module graph.
 */
export const MOTION_ALLOWED_QUERY = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
export const MOTION_FINE_POINTER_QUERY =
  "(hover: hover) and (pointer: fine) and (min-width: 768px)";
