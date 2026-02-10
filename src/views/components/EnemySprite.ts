import { el } from '../../utils/render.ts';
import type { Enemy } from '../../models/types.ts';

export function createEnemySprite(enemy: Enemy): HTMLElement {
  const container = el('div', { class: 'enemy-area' });

  const sprite = el('div', { class: 'enemy-sprite' }, enemy.emoji);
  const nameEl = el('div', { class: 'enemy-name' },
    el('span', {}, enemy.name),
    ` Lv.${enemy.level}`,
  );

  container.appendChild(sprite);
  container.appendChild(nameEl);
  return container;
}

export function shakeEnemy(container: HTMLElement): void {
  const sprite = container.querySelector('.enemy-sprite') as HTMLElement | null;
  if (sprite) {
    sprite.classList.add('hit');
    setTimeout(() => sprite.classList.remove('hit'), 400);
  }
}
