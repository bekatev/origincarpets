/** Runs before paint to avoid light/dark flash on load. */
export function ThemeScript() {
  const script = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var match = document.cookie.match(/(?:^|; )site_theme=([^;]*)/);
    var cookie = match ? decodeURIComponent(match[1]) : '';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : cookie === 'dark' || cookie === 'light'
        ? cookie
        : prefersDark
          ? 'dark'
          : 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (e) {}
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
