import i18n from 'i18next';

import type { TryStatus } from '@/types/kpt';

/**
 * ステータスのラベルを取得する
 */
export const getStatusLabels = (): Record<TryStatus, string> => ({
  pending: i18n.t('board:未対応'),
  in_progress: i18n.t('board:対応中'),
  done: i18n.t('board:完了'),
  wont_fix: i18n.t('board:対応不要'),
});

/**
 * タイマープリセット（秒）
 */
export const TIMER_PRESET_SECONDS = [60, 180, 300, 600] as const;

/**
 * 翻訳されたタイマープリセットを取得する
 */
export const getTimerPresets = () => [
  { label: i18n.t('board:1分'), seconds: 60 },
  { label: i18n.t('board:3分'), seconds: 180 },
  { label: i18n.t('board:5分'), seconds: 300 },
  { label: i18n.t('board:10分'), seconds: 600 },
];
