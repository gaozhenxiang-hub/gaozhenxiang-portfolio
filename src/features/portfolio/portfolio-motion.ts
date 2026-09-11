export interface ExperienceLayout {
  heroProgress: number;
  galleryPosition: number;
}

export interface HeroVisuals {
  portalOpen: number;
  filmRetreat: number;
  cameraAdvance: number;
  copyOpacity: number;
  galleryReveal: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function smoothRange(value: number, start: number, end: number) {
  if (end <= start) return value >= end ? 1 : 0;
  const normalized = clamp01((value - start) / (end - start));
  return normalized * normalized * (3 - 2 * normalized);
}

export function calculateExperienceLayout(
  position: number,
  heroDistance: number,
): ExperienceLayout {
  const safePosition = Math.max(0, position);
  if (heroDistance <= 0) {
    return { heroProgress: 1, galleryPosition: safePosition };
  }
  return {
    heroProgress: clamp01(safePosition / heroDistance),
    galleryPosition: Math.max(0, safePosition - heroDistance),
  };
}

export function mapHeroProgressToVisuals(progress: number): HeroVisuals {
  const safe = clamp01(progress);
  return {
    portalOpen: smoothRange(safe, 0, 0.68),
    filmRetreat: smoothRange(safe, 0.22, 0.68),
    cameraAdvance: smoothRange(safe, 0.68, 1),
    copyOpacity: 1 - smoothRange(safe, 0.28, 0.76),
    galleryReveal: smoothRange(safe, 0.72, 1),
  };
}
