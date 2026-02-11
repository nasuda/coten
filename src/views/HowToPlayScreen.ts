// ============================================================
// 遊び方ガイド画面 (スライド形式)
// ============================================================

import { el, onClick, setScreen, setText } from '../utils/render.ts';
import { playTap } from '../utils/audio.ts';
import { renderTitleScreen } from './TitleScreen.ts';
import { renderMenuScreen } from './MenuScreen.ts';

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
      '「冒険に出る」でステージを選べ！',
      'ステージごとに古文の問題が出題される。',
      '正解すると敵にダメージ！',
      '全ターン終了時に敵HPを0にすれば勝利だ。',
    ],
  },
  {
    icon: '❓',
    title: '問題の型',
    lines: [
      '【接続】助動詞が付く活用形を選べ',
      '【意味】助動詞の意味を当てろ',
      '【活用】正しい活用形を選べ',
      '【複合】ボス戦限定！複合問題だ',
    ],
  },
  {
    icon: '⏱️',
    title: '速度ボーナス',
    lines: [
      '回答が速いほどダメージUP！',
      '0〜3秒 → 1.3倍（神速）',
      '3〜7秒 → 1.0倍（通常）',
      '7〜10秒 → 0.8倍（遅延）',
    ],
  },
  {
    icon: '🔥',
    title: 'コンボシステム',
    lines: [
      '連続正解でコンボゲージが溜まる！',
      'ゲージ100%で必殺技が発動可能に。',
      '必殺技は絶大なダメージを与えるぞ。',
      '不正解でゲージはリセット…集中せよ！',
    ],
  },
  {
    icon: '🌀',
    title: '属性相性',
    lines: [
      '炎 → 氷 → 風 → 炎（三すくみ）',
      '光 ⇔ 闇（互いに有利）',
      '地 → 幻 → 水 → 地（三すくみ）',
      '有利属性で攻撃するとダメージ増！',
    ],
  },
  {
    icon: '🎰',
    title: 'ガチャ・カード強化',
    lines: [
      '💎石を使ってガチャを回せ！',
      'レアリティ: N / R / SR / SSR',
      'カード強化で攻撃力を上げられる。',
      '石はバトル勝利やチャプター制覇で入手。',
    ],
  },
  {
    icon: '🃏',
    title: 'デッキ編集',
    lines: [
      'デッキは5枚で構成される。',
      '手持ちカードから自由に入れ替えよう。',
      '属性バランスを考えるのがコツだ。',
      '図鑑コンプリートを目指せ！',
    ],
  },
];

export function renderHowToPlayScreen(returnTo: 'title' | 'menu'): void {
  setScreen('howtoplay', () => {
    const screen = el('div', { class: 'howto-screen' });
    let currentIndex = 0;

    // ヘッダー
    const header = el('div', { class: 'world-header' });
    const backBtn = el('button', { class: 'btn btn--small' }, '← 戻る');
    onClick(backBtn, () => {
      playTap();
      if (returnTo === 'title') renderTitleScreen();
      else renderMenuScreen();
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
