// ============================================================
// 画面遷移管理 & DOM操作ヘルパー
// ============================================================

export type ScreenType = 'title' | 'menu' | 'world' | 'battle' | 'result' | 'gacha' | 'zukan' | 'card_upgrade' | 'deck_edit' | 'boss_rush' | 'howtoplay';

let currentScreen: ScreenType | null = null;

export function getApp(): HTMLElement {
  const app = document.getElementById('app');
  if (!app) throw new Error('#app not found');
  return app;
}

export function setScreen(type: ScreenType, renderFn: () => HTMLElement): void {
  const app = getApp();

  const current = app.querySelector('.screen.active');
  if (current) {
    current.classList.remove('active');
    setTimeout(() => current.remove(), 400);
  }

  const screen = renderFn();
  screen.classList.add('screen');
  screen.dataset.screen = type;
  app.appendChild(screen);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      screen.classList.add('active');
    });
  });

  currentScreen = type;
}

export function getCurrentScreen(): ScreenType | null {
  return currentScreen;
}

// --- DOM ヘルパー ---

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  ...children: (string | HTMLElement)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'class') {
        element.className = value;
      } else if (key.startsWith('data-')) {
        element.dataset[key.slice(5)] = value;
      } else {
        element.setAttribute(key, value);
      }
    }
  }

  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }

  return element;
}

export function onClick(element: HTMLElement, handler: (e: MouseEvent) => void): void {
  element.addEventListener('click', handler);
}

export function setText(element: HTMLElement, text: string): void {
  element.textContent = text;
}

export function addClass(element: HTMLElement, ...classes: string[]): void {
  element.classList.add(...classes);
}

export function removeClass(element: HTMLElement, ...classes: string[]): void {
  element.classList.remove(...classes);
}

export function show(element: HTMLElement): void {
  element.style.display = '';
}

export function hide(element: HTMLElement): void {
  element.style.display = 'none';
}

export function animateElement(element: HTMLElement, animClass: string, duration = 400): Promise<void> {
  return new Promise((resolve) => {
    element.classList.add(animClass);
    setTimeout(() => {
      element.classList.remove(animClass);
      resolve();
    }, duration);
  });
}

export function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
