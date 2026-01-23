import { describe, expect, it } from 'vitest';

import { mapRowToItem, type ItemRowWithProfiles } from './item-mapper';

const createMockRow = (overrides: Partial<ItemRowWithProfiles> = {}): ItemRowWithProfiles => ({
  id: 'item-1',
  board_id: 'board-1',
  column_name: 'keep',
  text: 'テストテキスト',
  position: 1000,
  author_id: 'user-1',
  created_at: '2024-01-15T10:30:00.000Z',
  updated_at: '2024-01-15T11:00:00.000Z',
  status: null,
  assignee_id: null,
  due_date: null,
  allowed_user_ids: ['user-1'],
  ...overrides,
});

describe('mapRowToItem', () => {
  it('基本的なフィールドが正しくマッピングされること', () => {
    const row = createMockRow();
    const result = mapRowToItem(row);

    expect(result).toEqual({
      id: 'item-1',
      boardId: 'board-1',
      column: 'keep',
      text: 'テストテキスト',
      position: 1000,
      authorId: 'user-1',
      authorNickname: null,
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T11:00:00.000Z',
      status: null,
      assigneeId: null,
      assigneeNickname: null,
      dueDate: null,
      voteCount: 0,
      hasVoted: false,
      voters: [],
    });
  });

  it('column_nameがKptColumnTypeとして正しくマッピングされること', () => {
    const keepRow = createMockRow({ column_name: 'keep' });
    const problemRow = createMockRow({ column_name: 'problem' });
    const tryRow = createMockRow({ column_name: 'try' });

    expect(mapRowToItem(keepRow).column).toBe('keep');
    expect(mapRowToItem(problemRow).column).toBe('problem');
    expect(mapRowToItem(tryRow).column).toBe('try');
  });

  it('statusがTryStatusとして正しくマッピングされること', () => {
    const pendingRow = createMockRow({ status: 'pending' });
    const inProgressRow = createMockRow({ status: 'in_progress' });
    const doneRow = createMockRow({ status: 'done' });
    const wontFixRow = createMockRow({ status: 'wont_fix' });

    expect(mapRowToItem(pendingRow).status).toBe('pending');
    expect(mapRowToItem(inProgressRow).status).toBe('in_progress');
    expect(mapRowToItem(doneRow).status).toBe('done');
    expect(mapRowToItem(wontFixRow).status).toBe('wont_fix');
  });

  it('author_nicknameが存在する場合に正しくマッピングされること', () => {
    const row = createMockRow({ author_nickname: 'テストユーザー' });
    const result = mapRowToItem(row);

    expect(result.authorNickname).toBe('テストユーザー');
  });

  it('author_nicknameがundefinedの場合にnullになること', () => {
    const row = createMockRow({ author_nickname: undefined });
    const result = mapRowToItem(row);

    expect(result.authorNickname).toBeNull();
  });

  it('assignee_nicknameが存在する場合に正しくマッピングされること', () => {
    const row = createMockRow({
      assignee_id: 'user-2',
      assignee_nickname: '担当者',
    });
    const result = mapRowToItem(row);

    expect(result.assigneeId).toBe('user-2');
    expect(result.assigneeNickname).toBe('担当者');
  });

  it('assignee_nicknameがundefinedの場合にnullになること', () => {
    const row = createMockRow({
      assignee_id: 'user-2',
      assignee_nickname: undefined,
    });
    const result = mapRowToItem(row);

    expect(result.assigneeNickname).toBeNull();
  });

  it('vote_countが存在する場合に正しくマッピングされること', () => {
    const row = createMockRow({ vote_count: 5 });
    const result = mapRowToItem(row);

    expect(result.voteCount).toBe(5);
  });

  it('vote_countがundefinedの場合に0になること', () => {
    const row = createMockRow({ vote_count: undefined });
    const result = mapRowToItem(row);

    expect(result.voteCount).toBe(0);
  });

  it('has_votedが存在する場合に正しくマッピングされること', () => {
    const row = createMockRow({ has_voted: true });
    const result = mapRowToItem(row);

    expect(result.hasVoted).toBe(true);
  });

  it('has_votedがundefinedの場合にfalseになること', () => {
    const row = createMockRow({ has_voted: undefined });
    const result = mapRowToItem(row);

    expect(result.hasVoted).toBe(false);
  });

  it('votersが存在する場合に正しくマッピングされること', () => {
    const voters = [
      { id: 'user-1', nickname: 'ユーザー1' },
      { id: 'user-2', nickname: 'ユーザー2' },
    ];
    const row = createMockRow({ voters });
    const result = mapRowToItem(row);

    expect(result.voters).toEqual(voters);
  });

  it('votersがundefinedの場合に空配列になること', () => {
    const row = createMockRow({ voters: undefined });
    const result = mapRowToItem(row);

    expect(result.voters).toEqual([]);
  });

  it('due_dateが存在する場合に正しくマッピングされること', () => {
    const row = createMockRow({ due_date: '2024-02-01' });
    const result = mapRowToItem(row);

    expect(result.dueDate).toBe('2024-02-01');
  });

  it('Tryアイテムの全フィールドが正しくマッピングされること', () => {
    const row = createMockRow({
      column_name: 'try',
      status: 'in_progress',
      assignee_id: 'user-2',
      assignee_nickname: '担当者',
      due_date: '2024-02-15',
      vote_count: 3,
      has_voted: true,
      voters: [{ id: 'user-1', nickname: 'ユーザー1' }],
    });
    const result = mapRowToItem(row);

    expect(result.column).toBe('try');
    expect(result.status).toBe('in_progress');
    expect(result.assigneeId).toBe('user-2');
    expect(result.assigneeNickname).toBe('担当者');
    expect(result.dueDate).toBe('2024-02-15');
    expect(result.voteCount).toBe(3);
    expect(result.hasVoted).toBe(true);
    expect(result.voters).toHaveLength(1);
  });
});
