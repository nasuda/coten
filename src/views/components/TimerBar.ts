import { el } from '../../utils/render.ts';

export function createTimerBar(): HTMLElement {
  const container = el('div', { class: 'timer-area' });
  const bar = el('div', { class: 'timer-bar' });
  const fill = el('div', { class: 'timer-fill' });
  const text = el('span', { class: 'timer-text' }, '10');

  bar.appendChild(fill);
  container.appendChild(bar);
  container.appendChild(text);
  return container;
}

export function updateTimerBar(container: HTMLElement, remaining: number, total: number): void {
  const percent = Math.max(0, (remaining / total) * 100);
  const fill = container.querySelector('.timer-fill') as HTMLElement | null;
  const text = container.querySelector('.timer-text') as HTMLElement | null;

  if (fill) {
    fill.style.width = `${percent}%`;
    if (remaining <= 3) {
      fill.classList.add('danger');
    } else {
      fill.classList.remove('danger');
    }
  }
  if (text) text.textContent = `${Math.ceil(remaining)}`;
}
