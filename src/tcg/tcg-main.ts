// ============================================================
// 言霊大戦 ～コトダマ・ウォーズ～ エントリポイント
// ============================================================

import '../styles/main.css';
import './styles/tcg.css';
import { getProfiles, getActiveProfileId } from '../utils/storage.ts';
import { migrateLegacyTCGSave } from './views/tcg-storage.ts';
import { renderTCGTitleScreen } from './views/TCGTitleScreen.ts';
import { renderTCGProfileScreen } from './views/TCGProfileScreen.ts';

const profiles = getProfiles();
const activeId = getActiveProfileId();

if (activeId && profiles.some(p => p.id === activeId)) {
  migrateLegacyTCGSave();
  renderTCGTitleScreen();
} else {
  renderTCGProfileScreen();
}
