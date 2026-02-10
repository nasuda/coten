// ============================================================
// 図鑑画面
// ============================================================

import { el, onClick, setScreen } from '../utils/render.ts';
import { playTap } from '../utils/audio.ts';
import { getOrCreateSave } from '../utils/storage.ts';
import { allJodoushi } from '../data/jodoushi.ts';
import { allEnemies } from '../data/enemies.ts';
import { getMasteryStars } from '../models/ZukanManager.ts';
import { renderMenuScreen } from './MenuScreen.ts';

function clearElement(element: HTMLElement): void {
  while (element.firstChild) element.removeChild(element.firstChild);
}

export function renderZukanScreen(): void {
  setScreen('zukan', () => {
    const screen = el('div', { class: 'zukan-screen' });
    const save = getOrCreateSave();

    // ヘッダー
    const header = el('div', { class: 'world-header' });
    const backBtn = el('button', { class: 'btn btn--small' }, '← 戻る');
    onClick(backBtn, () => { playTap(); renderMenuScreen(); });
    header.appendChild(backBtn);
    header.appendChild(el('span', { class: 'text-gold', style: 'font-weight: 700' }, '図鑑'));
    header.appendChild(el('span', {})); // spacer

    // タブ
    const tabs = el('div', { class: 'zukan-tabs' });
    const jodoushiTab = el('div', { class: 'zukan-tab active' }, '助動詞');
    const enemyTab = el('div', { class: 'zukan-tab' }, '敵');

    tabs.appendChild(jodoushiTab);
    tabs.appendChild(enemyTab);

    // リスト
    const list = el('div', { class: 'zukan-list scroll-container' });

    function renderJodoushiList(): void {
      clearElement(list);
      for (const j of allJodoushi) {
        const entry = save.zukanJodoushi.find(e => e.id === j.id);
        const encountered = entry?.encountered ?? false;

        const card = el('div', { class: `zukan-entry${encountered ? '' : ' unknown'}` });
        card.appendChild(el('div', { class: `zukan-entry-name element-${j.element}` }, encountered ? j.name : '???'));

        if (encountered) {
          card.appendChild(el('div', { class: 'zukan-entry-detail' }, j.meanings.join('・')));
          card.appendChild(el('div', { class: 'zukan-entry-detail' }, j.connection));
          const mastery = entry?.masteryLevel ?? 0;
          card.appendChild(el('div', { class: 'mastery-stars' }, getMasteryStars(mastery)));
        }

        list.appendChild(card);
      }
    }

    function renderEnemyList(): void {
      clearElement(list);
      for (const e of allEnemies) {
        const entry = save.zukanEnemies.find(z => z.id === e.id);
        const encountered = entry?.encountered ?? false;

        const card = el('div', { class: `zukan-entry${encountered ? '' : ' unknown'}` });
        card.appendChild(el('div', { style: 'font-size: 2rem' }, encountered ? e.emoji : '❓'));
        card.appendChild(el('div', { class: 'zukan-entry-name' }, encountered ? e.name : '???'));

        if (encountered) {
          card.appendChild(el('div', { class: 'zukan-entry-detail' }, `Lv.${e.level} HP:${e.maxHP}`));
          card.appendChild(el('div', { class: 'zukan-entry-detail' }, `撃破: ${entry?.defeatCount ?? 0}回`));
        }

        list.appendChild(card);
      }
    }

    onClick(jodoushiTab, () => {
      playTap();
      jodoushiTab.classList.add('active');
      enemyTab.classList.remove('active');
      renderJodoushiList();
    });

    onClick(enemyTab, () => {
      playTap();
      enemyTab.classList.add('active');
      jodoushiTab.classList.remove('active');
      renderEnemyList();
    });

    renderJodoushiList();

    screen.appendChild(header);
    screen.appendChild(tabs);
    screen.appendChild(list);

    return screen;
  });
}
