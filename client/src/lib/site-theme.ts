export interface SiteTheme {
  bg: string;
  text: string;
  primary: string;
  border: string;
  header: string;
}

const STORAGE_KEY = "portfolio-global-theme";

export function applyGlobalTheme(theme: SiteTheme) {
  const root = document.documentElement;
  root.style.setProperty("--global-theme-bg", theme.bg);
  root.style.setProperty("--global-theme-text", theme.text);
  root.style.setProperty("--global-theme-primary", theme.primary);
  root.style.setProperty("--global-theme-border", theme.border);
  root.style.setProperty("--global-theme-header", theme.header);
  document.body.style.backgroundColor = theme.bg;
  document.body.style.color = theme.text;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}

export function restoreGlobalTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    applyGlobalTheme(JSON.parse(saved) as SiteTheme);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}
