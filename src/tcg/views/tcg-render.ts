// ============================================================
// TCG用 画面遷移管理（RPGとは独立）
// ============================================================

import type { TCGScreenType } from '../models/tcg-types.ts';

export { el, onClick, setText, addClass, removeClass, show, hide, animateElement, waitMs } from '../../utils/render.ts';

let currentScreen: TCGScreenType | null = null;

export function getApp(): HTMLElement {
  const app = document.getElementById('app');
  if (!app) throw new Error('#app not found');
  return app;
}

export function setTCGScreen(type: TCGScreenType, renderFn: () => HTMLElement): void {
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

export function getCurrentTCGScreen(): TCGScreenType | null {
  return currentScreen;
}

export function clearElement(el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}
