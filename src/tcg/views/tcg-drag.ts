// ============================================================
// TCG ドラッグ＆ドロップ管理 (Pointer Events)
// ============================================================

interface DragState {
  active: boolean;
  cardIndex: number;
  cardType: 'verb' | 'jodoushi';
  ghostEl: HTMLElement | null;
  sourceEl: HTMLElement | null;
  startX: number;
  startY: number;
  moved: boolean;
}

type DropCallback = (cardIndex: number, cardType: 'verb' | 'jodoushi') => void;

interface DropTarget {
  el: HTMLElement;
  accepts: 'verb' | 'jodoushi';
  callback: DropCallback;
}

const DRAG_THRESHOLD = 5;

let dragState: DragState = {
  active: false,
  cardIndex: -1,
  cardType: 'verb',
  ghostEl: null,
  sourceEl: null,
  startX: 0,
  startY: 0,
  moved: false,
};

const dropTargets: DropTarget[] = [];

export function setupDraggable(
  cardEl: HTMLElement,
  index: number,
  cardType: 'verb' | 'jodoushi',
  _onDrop?: DropCallback,
): void {
  cardEl.style.touchAction = 'none';

  cardEl.addEventListener('pointerdown', (e: PointerEvent) => {
    if (dragState.active) return;
    e.preventDefault();
    cardEl.setPointerCapture(e.pointerId);

    dragState = {
      active: true,
      cardIndex: index,
      cardType,
      ghostEl: null,
      sourceEl: cardEl,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
  });

  cardEl.addEventListener('pointermove', (e: PointerEvent) => {
    if (!dragState.active || dragState.sourceEl !== cardEl) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    if (!dragState.moved && Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;

    if (!dragState.moved) {
      dragState.moved = true;
      dragState.ghostEl = createGhost(cardEl);
      document.body.appendChild(dragState.ghostEl);
      cardEl.classList.add('dragging');
    }

    if (dragState.ghostEl) {
      dragState.ghostEl.style.left = `${e.clientX - 35}px`;
      dragState.ghostEl.style.top = `${e.clientY - 45}px`;
    }

    updateDropHighlights(e.clientX, e.clientY);
  });

  cardEl.addEventListener('pointerup', (e: PointerEvent) => {
    if (!dragState.active || dragState.sourceEl !== cardEl) return;

    if (dragState.moved) {
      const target = findDropTarget(e.clientX, e.clientY);
      if (target) {
        target.callback(dragState.cardIndex, dragState.cardType);
      }
    }
    // moved=false の場合は既存の onClick が発火する

    cleanupDrag();
  });

  cardEl.addEventListener('pointercancel', () => {
    if (dragState.sourceEl === cardEl) {
      cleanupDrag();
    }
  });
}

export function setupDropTarget(
  slotEl: HTMLElement,
  accepts: 'verb' | 'jodoushi',
  callback: DropCallback,
): void {
  dropTargets.push({ el: slotEl, accepts, callback });
}

export function cleanupDrag(): void {
  if (dragState.ghostEl) {
    dragState.ghostEl.remove();
  }
  if (dragState.sourceEl) {
    dragState.sourceEl.classList.remove('dragging');
  }
  clearHighlights();
  dragState = {
    active: false,
    cardIndex: -1,
    cardType: 'verb',
    ghostEl: null,
    sourceEl: null,
    startX: 0,
    startY: 0,
    moved: false,
  };
}

export function clearDropTargets(): void {
  dropTargets.length = 0;
}

export function isDragging(): boolean {
  return dragState.active && dragState.moved;
}

// --- internal ---

function createGhost(sourceEl: HTMLElement): HTMLElement {
  const ghost = sourceEl.cloneNode(true) as HTMLElement;
  ghost.className = 'tcg-drag-ghost';
  ghost.style.width = `${sourceEl.offsetWidth}px`;
  ghost.style.height = `${sourceEl.offsetHeight}px`;
  return ghost;
}

function findDropTarget(x: number, y: number): DropTarget | null {
  const els = document.elementsFromPoint(x, y);
  for (const target of dropTargets) {
    if (target.accepts !== dragState.cardType) continue;
    if (els.includes(target.el)) return target;
  }
  return null;
}

function updateDropHighlights(x: number, y: number): void {
  const els = document.elementsFromPoint(x, y);
  for (const target of dropTargets) {
    if (target.accepts !== dragState.cardType) continue;
    if (els.includes(target.el)) {
      target.el.classList.add('drop-highlight');
    } else {
      target.el.classList.remove('drop-highlight');
    }
  }
}

function clearHighlights(): void {
  for (const target of dropTargets) {
    target.el.classList.remove('drop-highlight');
  }
}
