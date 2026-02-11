// ============================================================
// TCG 接続クイズ練習モード
// ============================================================

import { el, onClick, setTCGScreen, clearElement } from './tcg-render.ts';
import { playTap, playCorrect, playWrong } from '../../utils/audio.ts';
import { allVerbs } from '../data/verbs.ts';
import { allTCGJodoushiCards } from '../data/tcg-cards.ts';
import { checkConnection, getConjugationChoices } from '../models/ConnectionValidator.ts';
import type { TCGVerbCardDef, TCGJodoushiCard } from '../models/tcg-types.ts';
import { applyPracticeResult } from './tcg-storage.ts';
import { renderTCGTitleScreen } from './TCGTitleScreen.ts';
import { shuffle } from '../../utils/shuffle.ts';

const PRACTICE_QUESTIONS = 10;

interface PracticeQuestion {
  verb: TCGVerbCardDef;
  jodoushi: TCGJodoushiCard;
  correctForm: string;
  correctFormName: string;
}

interface PracticeResult {
  question: PracticeQuestion;
  selectedForm: string;
  isCorrect: boolean;
}

let questions: PracticeQuestion[] = [];
let results: PracticeResult[] = [];
let currentIndex = 0;

function generateQuestions(): PracticeQuestion[] {
  const pairs: PracticeQuestion[] = [];

  for (const verb of allVerbs) {
    for (const j of allTCGJodoushiCards) {
      const conn = checkConnection(j, verb);
      if (conn.canConnect && conn.requiredForm && conn.requiredFormName) {
        pairs.push({
          verb,
          jodoushi: j,
          correctForm: conn.requiredForm,
          correctFormName: conn.requiredFormName,
        });
      }
    }
  }

  return shuffle(pairs).slice(0, PRACTICE_QUESTIONS);
}

export function renderTCGPracticeScreen(): void {
  questions = generateQuestions();
  results = [];
  currentIndex = 0;

  setTCGScreen('tcg_practice', () => {
    const container = el('div', { class: 'tcg-practice' });
    renderQuestion(container);
    return container;
  });
}

function renderQuestion(container: HTMLElement): void {
  clearElement(container);

  if (currentIndex >= questions.length) {
    renderPracticeResult(container);
    return;
  }

  const q = questions[currentIndex]!;

  container.appendChild(el('div', { class: 'tcg-practice-header' },
    `接続練習（${currentIndex + 1}/${questions.length}）`));

  const prompt = el('div', { class: 'tcg-practice-prompt' });
  prompt.appendChild(el('div', { class: 'tcg-practice-verb' }, `「${q.verb.name}」(${getVerbTypeLabel(q.verb.verbType)})`));
  prompt.appendChild(el('div', { class: 'tcg-practice-jodoushi' }, `に「${q.jodoushi.name}」を接続するには？`));
  prompt.appendChild(el('div', { class: 'tcg-practice-hint' }, `(${q.jodoushi.connection})`));
  container.appendChild(prompt);

  const choices = getConjugationChoices(q.verb);
  const formsGrid = el('div', { class: 'tcg-quiz-forms' });

  for (const choice of choices) {
    const btn = el('button', {}, `${choice.form}（${choice.label}）`);
    onClick(btn, () => {
      const isCorrect = choice.form === q.correctForm;

      results.push({ question: q, selectedForm: choice.form, isCorrect });

      if (isCorrect) {
        playCorrect();
        btn.classList.add('correct');
      } else {
        playWrong();
        btn.classList.add('wrong');
        for (const otherBtn of formsGrid.children) {
          const text = (otherBtn as HTMLElement).textContent ?? '';
          if (text.includes(q.correctForm)) {
            (otherBtn as HTMLElement).classList.add('correct');
          }
        }
      }

      // 理由表示
      const reason = el('div', { class: 'tcg-quiz-reason' },
        `「${q.jodoushi.name}」は${q.correctFormName}に接続 → 正解は「${q.correctForm}」(${q.correctFormName})`);
      container.appendChild(reason);

      // ボタンを無効化
      for (const b of formsGrid.children) {
        (b as HTMLButtonElement).disabled = true;
      }

      // 次へボタン
      const nextBtn = el('button', { class: 'btn btn-primary', style: 'margin-top: 1rem;' },
        currentIndex < questions.length - 1 ? '次の問題' : '結果を見る');
      onClick(nextBtn, () => {
        playTap();
        currentIndex++;
        renderQuestion(container);
      });
      container.appendChild(nextBtn);
    });
    formsGrid.appendChild(btn);
  }

  container.appendChild(formsGrid);
}

function renderPracticeResult(container: HTMLElement): void {
  clearElement(container);

  const correct = results.filter(r => r.isCorrect).length;
  const total = results.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // 統計を保存
  applyPracticeResult(correct, total);

  container.appendChild(el('h2', {}, '練習結果'));
  container.appendChild(el('div', { class: 'accuracy-highlight' }, `${correct}/${total} (${accuracy}%)`));

  // 誤答レビュー
  const wrong = results.filter(r => !r.isCorrect);
  if (wrong.length > 0) {
    const reviewSection = el('div', { class: 'tcg-review' });
    reviewSection.appendChild(el('div', { class: 'tcg-review-title' }, '復習: 誤答'));

    for (const r of wrong) {
      const item = el('div', { class: 'tcg-review-item' });
      item.appendChild(el('div', { class: 'tcg-review-question' },
        `${r.question.jodoushi.name} → ${r.question.verb.name}`));
      const answerLine = el('div', { class: 'tcg-review-answer' });
      answerLine.appendChild(el('span', {}, `あなた: ${r.selectedForm}`));
      answerLine.appendChild(el('span', { class: 'tcg-review-correct' }, ` / 正解: ${r.question.correctForm} (${r.question.correctFormName})`));
      item.appendChild(answerLine);
      reviewSection.appendChild(item);
    }

    container.appendChild(reviewSection);
  } else {
    container.appendChild(el('p', {}, '全問正解! 見事な文法力だ!'));
  }

  // ボタン
  const btnRow = el('div', { class: 'tcg-actions' });

  const retryBtn = el('button', { class: 'btn-attack' }, 'もう1回');
  onClick(retryBtn, () => {
    playTap();
    renderTCGPracticeScreen();
  });

  const backBtn = el('button', { class: 'btn-pass' }, 'タイトルに戻る');
  onClick(backBtn, () => {
    playTap();
    renderTCGTitleScreen();
  });

  btnRow.appendChild(retryBtn);
  btnRow.appendChild(backBtn);
  container.appendChild(btnRow);
}

function getVerbTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    yodan: '四段',
    kami_nidan: '上二段',
    shimo_nidan: '下二段',
    kami_ichidan: '上一段',
    shimo_ichidan: '下一段',
    ka_hen: 'カ変',
    sa_hen: 'サ変',
    na_hen: 'ナ変',
    ra_hen: 'ラ変',
  };
  return labels[type] ?? type;
}
