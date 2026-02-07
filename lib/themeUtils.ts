/**
 * Utility functions for theme-aware styling
 * Use these functions to get theme-aware class names
 */

export function getThemeBg(): string {
  return "bg-[var(--theme-bg)]";
}

export function getThemeBgAlt(): string {
  return "bg-[var(--theme-bg-alt)]";
}

export function getThemeCard(): string {
  return "bg-[var(--theme-card)]";
}

export function getThemeCardAlt(): string {
  return "bg-[var(--theme-card-alt)]";
}

export function getThemeText(): string {
  return "text-[var(--theme-text)]";
}

export function getThemeTextSecondary(): string {
  return "text-[var(--theme-text-secondary)]";
}

export function getThemeBorder(): string {
  return "border-[var(--theme-border)]";
}

export function getThemeAccent(): string {
  return "bg-[var(--theme-accent)]";
}

export function getThemeAccentSecondary(): string {
  return "bg-[var(--theme-accent-secondary)]";
}

/**
 * Helper to get theme-aware classes
 * Usage: className={`${themeClasses.bg} ${themeClasses.text}`}
 */
export const themeClasses = {
  bg: getThemeBg(),
  bgAlt: getThemeBgAlt(),
  card: getThemeCard(),
  cardAlt: getThemeCardAlt(),
  text: getThemeText(),
  textSecondary: getThemeTextSecondary(),
  border: getThemeBorder(),
  accent: getThemeAccent(),
  accentSecondary: getThemeAccentSecondary(),
};
