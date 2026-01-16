-- item_votesテーブルを追加
--
-- KPTアイテムへの投票機能を実装する。
-- 1ユーザーは1アイテムに対して1回のみ投票可能（UNIQUE制約）。

BEGIN;

-- ============================================================
-- ステップ1: item_votesテーブルを作成
-- ============================================================

CREATE TABLE public.item_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(item_id, user_id)
);

-- item_idでの検索を高速化するためのインデックス
CREATE INDEX idx_item_votes_item_id ON public.item_votes(item_id);

-- ============================================================
-- ステップ2: RLS設定（service_roleのみアクセス可能）
-- ============================================================

ALTER TABLE public.item_votes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.item_votes FROM anon, authenticated;
GRANT ALL ON public.item_votes TO service_role;

CREATE POLICY "deny_all_access"
  ON public.item_votes
  FOR ALL
  USING (false);

COMMIT;
