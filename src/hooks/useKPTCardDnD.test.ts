import { describe, expect, it } from 'vitest';

import { calculateNewPosition } from './useKPTCardDnD';

import type { KptItem } from '@/types/kpt';

const createMockItem = (overrides: Partial<KptItem> = {}): KptItem => ({
  id: 'item-1',
  boardId: 'board-1',
  column: 'keep',
  text: 'テスト',
  position: 1000,
  authorId: 'user-1',
  authorNickname: 'テストユーザー',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('calculateNewPosition', () => {
  describe('空のカラムに配置する場合', () => {
    it('1000を返すこと', () => {
      const result = calculateNewPosition([], 0);
      expect(result).toBe(1000);
    });
  });

  describe('先頭に配置する場合', () => {
    it('最初のアイテムのpositionの半分を返すこと', () => {
      const targetList = [createMockItem({ id: '1', position: 1000 })];
      const result = calculateNewPosition(targetList, 0);
      expect(result).toBe(500);
    });

    it('最初のアイテムのpositionが小さい場合も正しく計算されること', () => {
      const targetList = [createMockItem({ id: '1', position: 100 })];
      const result = calculateNewPosition(targetList, 0);
      expect(result).toBe(50);
    });
  });

  describe('末尾に配置する場合', () => {
    it('最後のアイテムのpositionに1000を加えた値を返すこと', () => {
      const targetList = [createMockItem({ id: '1', position: 1000 })];
      const result = calculateNewPosition(targetList, 1);
      expect(result).toBe(2000);
    });

    it('複数アイテムがある場合も最後のアイテムを基準にすること', () => {
      const targetList = [
        createMockItem({ id: '1', position: 1000 }),
        createMockItem({ id: '2', position: 2000 }),
        createMockItem({ id: '3', position: 3000 }),
      ];
      const result = calculateNewPosition(targetList, 3);
      expect(result).toBe(4000);
    });
  });

  describe('2つのアイテムの間に配置する場合', () => {
    it('前後のpositionの平均値を返すこと', () => {
      const targetList = [createMockItem({ id: '1', position: 1000 }), createMockItem({ id: '2', position: 2000 })];
      const result = calculateNewPosition(targetList, 1);
      expect(result).toBe(1500);
    });

    it('3つのアイテムの2番目に挿入する場合', () => {
      const targetList = [
        createMockItem({ id: '1', position: 1000 }),
        createMockItem({ id: '2', position: 2000 }),
        createMockItem({ id: '3', position: 3000 }),
      ];
      const result = calculateNewPosition(targetList, 1);
      expect(result).toBe(1500);
    });

    it('3つのアイテムの3番目に挿入する場合', () => {
      const targetList = [
        createMockItem({ id: '1', position: 1000 }),
        createMockItem({ id: '2', position: 2000 }),
        createMockItem({ id: '3', position: 3000 }),
      ];
      const result = calculateNewPosition(targetList, 2);
      expect(result).toBe(2500);
    });

    it('positionが近い場合も正しく中間値を計算すること', () => {
      const targetList = [createMockItem({ id: '1', position: 1000 }), createMockItem({ id: '2', position: 1001 })];
      const result = calculateNewPosition(targetList, 1);
      expect(result).toBe(1000.5);
    });
  });
});
