import { el } from '../../utils/render.ts';

export function showDamageNumber(
  parent: HTMLElement,
  damage: number,
  type: 'player' | 'enemy',
  isCritical = false,
): void {
  const cls = `damage-number ${type}${isCritical ? ' critical' : ''}`;
  const numEl = el('div', { class: cls }, String(damage));

  // 位置をランダムに少しずらす
  const offsetX = Math.random() * 40 - 20;
  numEl.style.left = `calc(50% + ${offsetX}px)`;
  numEl.style.top = type === 'enemy' ? '20%' : '70%';

  parent.appendChild(numEl);
  setTimeout(() => numEl.remove(), 1000);
}

export function showSpeedLabel(parent: HTMLElement, label: string): void {
  if (!label) return;
  const labelEl = el('div', { class: 'speed-label' }, label);
  parent.appendChild(labelEl);
  setTimeout(() => labelEl.remove(), 800);
}
