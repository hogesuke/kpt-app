-- ai_usage_logsテーブルを追加
--
-- AI機能（サマリー生成など）の利用ログを記録し、レート制限に使用する。
-- ログインユーザーは1日5回までの制限をこのテーブルで管理する。

BEGIN;

-- ============================================================
-- ステップ1: ai_usage_logsテーブルを作成
-- ============================================================

CREATE TABLE public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- レート制限チェック用のインデックス
CREATE INDEX idx_ai_usage_logs_user_feature_date
ON public.ai_usage_logs(user_id, feature, created_at);

-- ============================================================
-- ステップ2: RLS設定（service_roleのみアクセス可能）
-- ============================================================

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.ai_usage_logs FROM anon, authenticated;
GRANT ALL ON public.ai_usage_logs TO service_role;

CREATE POLICY "deny_all_access"
  ON public.ai_usage_logs
  FOR ALL
  USING (false);

COMMIT;
