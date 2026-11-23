export type Appearance = 'light' | 'dark' | 'system'

type AppearanceStore = {
  get: () => Appearance
  set: (value: Appearance) => void
  subscribe: (listener: () => void) => () => void
}

declare global {
  interface Window { giuntiAppearance?: AppearanceStore }
}

// The document runs this before hydration or any interaction bundle.
export const appearanceBootstrap = `(() => {
  const key = 'giunti.appearance.v1';
  const settings = window.matchMedia('(prefers-color-scheme: dark)');
  const root = document.documentElement;
  const listeners = new Set();
  const parse = value => value === 'light' || value === 'dark' ? value : 'system';
  let preference = 'system';
  try { preference = parse(window.localStorage.getItem(key)); } catch {}

  function apply() {
    root.dataset.themePreference = preference;
    root.dataset.theme = preference === 'system' ? (settings.matches ? 'dark' : 'light') : preference;
  }

  function update(value) {
    preference = parse(value);
    apply();
    listeners.forEach(listener => listener());
  }

  apply();
  settings.addEventListener('change', () => { if (preference === 'system') apply(); });
  window.addEventListener('storage', event => {
    try { if (event.storageArea !== window.localStorage) return; } catch { return; }
    if (event.key === key || event.key === null) update(event.newValue);
  });

  window.giuntiAppearance = {
    get: () => preference,
    set: value => {
      update(value);
      try { window.localStorage.setItem(key, preference); } catch {}
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
})();`
