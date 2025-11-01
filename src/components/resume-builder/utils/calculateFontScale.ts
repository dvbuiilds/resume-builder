/**
 * Calculate proportional font scale factor based on content density
 * @param estimatedHeight - Estimated vertical height required for content (in points)
 * @param availableHeight - Available page height minus padding (default: 800pt for A4)
 * @returns Scale factor between 0.85 (min) and 1.2 (max)
 */
export const calculateFontScaleFactor = (
  estimatedHeight: number,
  availableHeight: number = 800,
): number => {
  const MIN_SCALE = 0.85;
  const MAX_SCALE = 1.2;
  const IDEAL_MIN_HEIGHT = 400; // Content is considered sparse below this
  const IDEAL_MAX_HEIGHT = 750; // Content is considered dense above this

  if (estimatedHeight < IDEAL_MIN_HEIGHT) {
    // Content is sparse - scale up proportionally
    // The more sparse, the more we scale up (up to MAX_SCALE)
    const ratio = estimatedHeight / IDEAL_MIN_HEIGHT;
    const scale = 1.0 + (1.0 - ratio) * 0.2; // Scale increases as ratio decreases
    return Math.min(scale, MAX_SCALE);
  } else if (estimatedHeight > IDEAL_MAX_HEIGHT) {
    // Content is dense - scale down proportionally
    // The more dense, the more we scale down (down to MIN_SCALE)
    const overflow = estimatedHeight - IDEAL_MAX_HEIGHT;
    const maxOverflow = availableHeight - IDEAL_MAX_HEIGHT;
    const scale = 1.0 - (overflow / maxOverflow) * 0.15; // Scale decreases as overflow increases
    return Math.max(scale, MIN_SCALE);
  }

  // Content is within ideal range - no scaling needed
  return 1.0;
};
