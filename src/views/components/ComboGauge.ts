import { el } from '../../utils/render.ts';

export function createComboGauge(combo: number, gauge: number): HTMLElement {
  const row = el('div', { class: 'combo-row' });
  const comboText = el('span', { class: 'combo-count' }, `Combo: x${combo}`);
  const gaugeBar = el('div', { class: 'gauge-bar' });
  const gaugeFill = el('div', { class: 'gauge-fill' });
  gaugeFill.style.width = `${Math.min(100, gauge)}%`;
  const gaugeText = el('span', { class: 'text-secondary' }, `${Math.floor(gauge)}%`);

  gaugeBar.appendChild(gaugeFill);
  row.appendChild(comboText);
  row.appendChild(gaugeBar);
  row.appendChild(gaugeText);
  return row;
}

export function updateComboGauge(container: HTMLElement, combo: number, gauge: number): void {
  const comboText = container.querySelector('.combo-count') as HTMLElement | null;
  const fill = container.querySelector('.gauge-fill') as HTMLElement | null;
  const gaugeText = container.querySelector('.text-secondary') as HTMLElement | null;

  if (comboText) {
    comboText.textContent = `Combo: x${combo}`;
    if (combo >= 3) comboText.classList.add('combo-flash');
  }
  if (fill) fill.style.width = `${Math.min(100, gauge)}%`;
  if (gaugeText) gaugeText.textContent = `${Math.floor(gauge)}%`;
}
