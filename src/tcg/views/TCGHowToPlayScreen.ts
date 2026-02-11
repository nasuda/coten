// ============================================================
// TCG 遊び方ガイド画面 (スライド形式)
// ============================================================

import { el, onClick, setTCGScreen, setText } from './tcg-render.ts';
import { playTap } from '../../utils/audio.ts';
import { renderTCGTitleScreen } from './TCGTitleScreen.ts';

interface Slide {
  icon: string;
  title: string;
  lines: string[];
}

const slides: Slide[] = [
  {
    icon: '⚔️',
    title: 'ゲームの基本',
    lines: [
      '手札から動詞カードをスロットに配置！',
      '助動詞カードで動詞を装備強化！',
      '装備した動詞で相手を攻撃せよ！',
    ],
  },
  {
    icon: '🃏',
    title: 'カードの種類',
    lines: [
      '【動詞カード】フィールドに配置する主力',
      '【助動詞カード】動詞に装備して攻撃力UP',
      '動詞＋助動詞の組み合わせが勝利の鍵！',
    ],
  },
  {
    icon: '❓',
    title: '接続クイズ',
    lines: [
      '助動詞を装備する時、活用形クイズが出題！',
      '正しい活用形を選べば装備成功。',
      '間違えると装備失敗…文法力を磨け！',
    ],
  },
  {
    icon: '💥',
    title: '攻撃と勝利',
    lines: [
      '装備済みの動詞で「攻撃」ボタンを押せ！',
      '相手の動詞カードのHPを0にすれば撃破。',
      '全スロットを破壊すれば勝利だ！',
    ],
  },
  {
    icon: '🌀',
    title: '属性相性',
    lines: [
      '炎 → 氷 → 風 → 炎（三すくみ）',
      '光 ⇔ 闇（互いに有利）',
      '地 → 幻 → 水 → 地（三すくみ）',
      '有利属性で攻撃するとダメージ1.5倍！',
    ],
  },
  {
    icon: '👆',
    title: '操作方法',
    lines: [
      'カードをスロットにドラッグで配置！',
      'タップ/クリックでも操作可能。',
      '制限時間内にアクションを選ぼう。',
      '時間切れは自動パスになるぞ！',
    ],
  },
];

export function renderTCGHowToPlayScreen(): void {
  setTCGScreen('tcg_howtoplay', () => {
    const screen = el('div', { class: 'howto-screen' });
    let currentIndex = 0;

    // ヘッダー
    const header = el('div', { class: 'world-header' });
    const backBtn = el('button', { class: 'btn btn--small' }, '← 戻る');
    onClick(backBtn, () => {
      playTap();
      renderTCGTitleScreen();
    });
    const headerTitle = el('span', { class: 'text-gold font-serif' }, '遊び方');
    header.appendChild(backBtn);
    header.appendChild(headerTitle);
    header.appendChild(el('span', {}));

    // スライドエリア
    const slideArea = el('div', { class: 'howto-slide-area' });
    const first = slides[0]!;
    const slideIcon = el('div', { class: 'howto-slide-icon' }, first.icon);
    const slideTitle = el('div', { class: 'howto-slide-title' }, first.title);
    const slideBody = el('div', { class: 'howto-slide-body' });

    slideArea.appendChild(slideIcon);
    slideArea.appendChild(slideTitle);
    slideArea.appendChild(slideBody);

    // ドットインジケーター
    const dots = el('div', { class: 'howto-dots' });
    const dotEls: HTMLElement[] = [];
    for (let i = 0; i < slides.length; i++) {
      const dot = el('div', { class: 'stage-dot' });
      dotEls.push(dot);
      dots.appendChild(dot);
    }

    // ナビゲーション
    const nav = el('div', { class: 'howto-nav' });
    const prevBtn = el('button', { class: 'btn btn--small' }, '← 前へ');
    const pageLabel = el('span', { class: 'howto-page-label' });
    const nextBtn = el('button', { class: 'btn btn--small' }, '次へ →');
    nav.appendChild(prevBtn);
    nav.appendChild(pageLabel);
    nav.appendChild(nextBtn);

    function renderSlide(): void {
      const slide = slides[currentIndex]!;
      setText(slideIcon, slide.icon);
      setText(slideTitle, slide.title);

      while (slideBody.firstChild) slideBody.removeChild(slideBody.firstChild);
      for (const line of slide.lines) {
        slideBody.appendChild(el('div', { class: 'howto-slide-line' }, line));
      }

      for (let i = 0; i < dotEls.length; i++) {
        dotEls[i]!.className = i === currentIndex ? 'stage-dot current' : 'stage-dot';
      }

      setText(pageLabel, `${currentIndex + 1} / ${slides.length}`);

      if (currentIndex === 0) {
        prevBtn.setAttribute('disabled', '');
        prevBtn.classList.add('disabled');
      } else {
        prevBtn.removeAttribute('disabled');
        prevBtn.classList.remove('disabled');
      }

      if (currentIndex === slides.length - 1) {
        nextBtn.setAttribute('disabled', '');
        nextBtn.classList.add('disabled');
      } else {
        nextBtn.removeAttribute('disabled');
        nextBtn.classList.remove('disabled');
      }
    }

    onClick(prevBtn, () => {
      if (currentIndex > 0) {
        playTap();
        currentIndex--;
        renderSlide();
      }
    });

    onClick(nextBtn, () => {
      if (currentIndex < slides.length - 1) {
        playTap();
        currentIndex++;
        renderSlide();
      }
    });

    renderSlide();

    screen.appendChild(header);
    screen.appendChild(slideArea);
    screen.appendChild(dots);
    screen.appendChild(nav);

    return screen;
  });
}
