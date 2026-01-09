-- ステータス値を 'open' から 'pending' に変更

-- 既存データを更新
UPDATE items SET status = 'pending' WHERE status = 'open';

-- CHECK制約を更新
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_status_check;
ALTER TABLE items ADD CONSTRAINT items_status_check
  CHECK (status IS NULL OR status IN ('pending', 'in_progress', 'done', 'wont_fix'));
