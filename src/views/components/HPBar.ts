import { el } from '../../utils/render.ts';

export function createHPBar(current: number, max: number, isEnemy: boolean): HTMLElement {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  const cls = isEnemy ? 'enemy' : 'player';

  const container = el('div', { class: `${cls}-hp-bar` });
  const fill = el('div', { class: `${cls}-hp-fill` });
  fill.style.width = `${percent}%`;
  const text = el('span', { class: `${cls}-hp-text` }, `${current}/${max}`);

  container.appendChild(fill);
  container.appendChild(text);
  return container;
}

export function updateHPBar(container: HTMLElement, current: number, max: number): void {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  const fill = container.querySelector('[class$="-hp-fill"]') as HTMLElement | null;
  const text = container.querySelector('[class$="-hp-text"]') as HTMLElement | null;
  if (fill) fill.style.width = `${percent}%`;
  if (text) text.textContent = `${current}/${max}`;
}
