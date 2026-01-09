-- Problemアイテム用のフィールドを追加
-- status: 未対応, 対応中, 完了, 対応不要
-- assignee_id: 担当者（board_membersのuser_id）
-- due_date: 期日

ALTER TABLE items ADD COLUMN status text;
ALTER TABLE items ADD COLUMN assignee_id uuid REFERENCES profiles(id);
ALTER TABLE items ADD COLUMN due_date date;

-- statusの値を制限するCHECK制約
ALTER TABLE items ADD CONSTRAINT items_status_check
  CHECK (status IS NULL OR status IN ('open', 'in_progress', 'done', 'wont_fix'));

-- Realtimeのpublicationを更新して新しいカラムを含める
ALTER PUBLICATION supabase_realtime DROP TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE items;
