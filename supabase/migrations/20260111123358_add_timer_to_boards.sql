-- ボードにタイマー機能を追加するマイグレーション
--
-- タイマー状態の設計:
-- - timer_started_at: タイマー開始時刻（NULL=停止中）
-- - timer_duration_seconds: 設定されたタイマー時間（秒）
-- - timer_hide_others_cards: タイマー中に他のメンバーのカードを非表示にするか
-- - timer_started_by: タイマーを開始したユーザーID
--
-- 残り時間の計算:
-- クライアント側で (timer_started_at + timer_duration_seconds) - 現在時刻 で計算

BEGIN;

-- boardsテーブルにタイマー関連カラムを追加
ALTER TABLE public.boards
ADD COLUMN IF NOT EXISTS timer_started_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timer_duration_seconds integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timer_hide_others_cards boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS timer_started_by uuid DEFAULT NULL;

-- timer_started_byの外部キー制約を追加
ALTER TABLE public.boards
ADD CONSTRAINT boards_timer_started_by_fkey
FOREIGN KEY (timer_started_by) REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- コメント追加
COMMENT ON COLUMN public.boards.timer_started_at IS 'タイマー開始時刻（NULL=タイマー停止中）';
COMMENT ON COLUMN public.boards.timer_duration_seconds IS 'タイマーの設定時間（秒）';
COMMENT ON COLUMN public.boards.timer_hide_others_cards IS 'タイマー中に他のメンバーのカードを非表示にするか';
COMMENT ON COLUMN public.boards.timer_started_by IS 'タイマーを開始したユーザーID';

COMMIT;
