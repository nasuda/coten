import { el } from '../../utils/render.ts';
import { getSkillByJodoushi } from '../../data/skills.ts';

export function showCutinOverlay(jodoushiId: string): Promise<void> {
  return new Promise((resolve) => {
    const skill = getSkillByJodoushi(jodoushiId);
    if (!skill) { resolve(); return; }

    const overlay = el('div', { class: 'cutin-overlay' });
    const bg = el('div', { class: 'cutin-bg' });
    const slash = el('div', { class: 'cutin-slash' });
    const textContainer = el('div', { class: 'cutin-text' });
    const ruby = el('div', { class: 'cutin-ruby' }, skill.ruby);
    const name = el('div', { class: 'cutin-skill-name' }, skill.name);

    textContainer.appendChild(ruby);
    textContainer.appendChild(name);
    overlay.appendChild(bg);
    overlay.appendChild(slash);
    overlay.appendChild(textContainer);

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      resolve();
    }, 1500);
  });
}
