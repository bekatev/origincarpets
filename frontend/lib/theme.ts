export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'site_theme';

export function normalizeTheme(value: string | null | undefined): Theme {
  return value === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function persistTheme(theme: Theme) {
  applyTheme(theme);
  localStorage.setItem('theme', theme);
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
}
