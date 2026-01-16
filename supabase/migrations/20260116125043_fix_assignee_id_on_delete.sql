-- assignee_idの外部キー制約にON DELETE SET NULLを追加
--
-- 問題:
-- assignee_idの外部キー制約にON DELETEが指定されていなかったため、
-- 担当者として設定されているユーザーのアカウント削除が失敗していた。
--
-- 解決:
-- ON DELETE SET NULLを追加し、ユーザー削除時に担当者フィールドを
-- NULLに設定するようにする。

BEGIN;

-- 既存の外部キー制約を削除
ALTER TABLE public.items
  DROP CONSTRAINT IF EXISTS items_assignee_id_fkey;

-- ON DELETE SET NULLを追加した新しい外部キー制約を作成
ALTER TABLE public.items
  ADD CONSTRAINT items_assignee_id_fkey
  FOREIGN KEY (assignee_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

COMMIT;
