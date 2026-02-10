import { el, onClick } from '../../utils/render.ts';
import type { SkillCard } from '../../models/types.ts';

const ELEMENT_ICONS: Record<string, string> = {
  fire: '🔥', ice: '❄️', wind: '🌪️', light: '✨', dark: '🌑', earth: '🪨', phantom: '👻', water: '💧',
};

export function createSkillCardView(
  card: SkillCard,
  index: number,
  onSelect: (index: number) => void,
): HTMLElement {
  const container = el('div', { class: 'skill-card', 'data-index': String(index) });
  const name = el('span', { class: `skill-card-name element-${card.element}` }, card.name);
  const rarity = el('span', { class: `skill-card-rarity rarity-${card.rarity}` }, card.rarity);
  const elemIcon = el('span', { class: 'skill-card-element' }, ELEMENT_ICONS[card.element] ?? '');

  container.appendChild(rarity);
  container.appendChild(name);
  container.appendChild(elemIcon);

  onClick(container, () => onSelect(index));

  return container;
}

export function setCardState(card: HTMLElement, state: 'selected' | 'correct' | 'wrong' | 'disabled' | 'normal'): void {
  card.classList.remove('selected', 'correct', 'wrong', 'disabled');
  if (state !== 'normal') card.classList.add(state);
}
