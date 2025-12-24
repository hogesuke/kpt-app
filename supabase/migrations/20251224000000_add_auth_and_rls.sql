-- NOTE: ボードメンバーのアクセス権限はEdge Functions内で検証する

alter table public.boards
  add column owner_id uuid references auth.users(id) on delete cascade;

create table public.board_members (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')) default 'member',
  created_at timestamptz not null default now(),
  unique(board_id, user_id)
);

create index board_members_board_id_idx on public.board_members(board_id);
create index board_members_user_id_idx on public.board_members(user_id);

-- すべてのテーブルでRLSを有効化
alter table public.boards enable row level security;
alter table public.items enable row level security;
alter table public.board_members enable row level security;

-- boardsテーブルのRLSポリシー
-- ユーザーは自分が所有するボードのみ閲覧可能
create policy "Users can view boards they own"
  on public.boards for select
  using (auth.uid() = owner_id);

-- ユーザーはボードを作成可能（作成者が所有者になる）
create policy "Users can create boards"
  on public.boards for insert
  with check (auth.uid() = owner_id);

-- 所有者のみが自分のボードを更新可能
create policy "Owners can update their boards"
  on public.boards for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- 所有者のみが自分のボードを削除可能
create policy "Owners can delete their boards"
  on public.boards for delete
  using (auth.uid() = owner_id);

-- itemsテーブルのRLSポリシー
-- ボード所有者はアイテムを閲覧可能
create policy "Board owners can view items"
  on public.items for select
  using (
    exists (
      select 1 from public.boards
      where boards.id = items.board_id
      and boards.owner_id = auth.uid()
    )
  );

-- ボード所有者はアイテムを作成可能
create policy "Board owners can create items"
  on public.items for insert
  with check (
    exists (
      select 1 from public.boards
      where boards.id = items.board_id
      and boards.owner_id = auth.uid()
    )
  );

-- ボード所有者はアイテムを更新可能
create policy "Board owners can update items"
  on public.items for update
  using (
    exists (
      select 1 from public.boards
      where boards.id = items.board_id
      and boards.owner_id = auth.uid()
    )
  );

-- ボード所有者はアイテムを削除可能
create policy "Board owners can delete items"
  on public.items for delete
  using (
    exists (
      select 1 from public.boards
      where boards.id = items.board_id
      and boards.owner_id = auth.uid()
    )
  );

-- board_membersテーブルのRLSポリシー
-- ユーザーは自分のメンバーシップのみ閲覧可能
create policy "Users can view their memberships"
  on public.board_members for select
  using (board_members.user_id = auth.uid());

-- 認証済みユーザーはボードメンバーを追加可能
-- アクセス制御はEdge Functionsレイヤーで検証されます
create policy "Service and authenticated users can insert"
  on public.board_members for insert
  to authenticated
  with check (true);

-- ボード所有者のみがメンバーを削除可能
create policy "Owners can remove members from their boards"
  on public.board_members for delete
  using (
    board_members.board_id in (
      select id from public.boards where owner_id = auth.uid()
    )
  );

-- ボード作成時に所有者を自動的にメンバーとして追加する関数
create or replace function public.add_owner_as_member()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.board_members (board_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

-- ボード作成時に所有者をメンバーとして追加するトリガー
create trigger on_board_created
  after insert on public.boards
  for each row
  execute function public.add_owner_as_member();
