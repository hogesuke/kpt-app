import i18n from 'i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { zodResolverWithI18n } from './zodResolverWithI18n';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string, options?: { ns?: string; min?: number; max?: number }) => {
      if (options?.min !== undefined) {
        return `${options.min}文字以上で入力してください`;
      }
      if (options?.max !== undefined) {
        return `${options.max}文字以内で入力してください`;
      }
      return key;
    }),
  },
}));

describe('zodResolverWithI18n', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('バリデーション成功時', () => {
    it('valuesにパースされたデータが含まれること', async () => {
      const schema = z.object({
        name: z.string().min(1),
      });
      const resolver = zodResolverWithI18n(schema);

      const result = await resolver({ name: 'テスト' }, {}, {} as never);

      expect(result.values).toEqual({ name: 'テスト' });
      expect(result.errors).toEqual({});
    });

    it('transformが適用されたデータが返されること', async () => {
      const schema = z.object({
        name: z.string().transform((v) => v.trim()),
      });
      const resolver = zodResolverWithI18n(schema);

      const result = await resolver({ name: '  テスト  ' }, {}, {} as never);

      expect(result.values).toEqual({ name: 'テスト' });
    });
  });

  describe('バリデーション失敗時', () => {
    it('errorsにエラー情報が含まれること', async () => {
      const schema = z.object({
        name: z.string().min(1, { message: 'エラーメッセージ' }),
      });
      const resolver = zodResolverWithI18n(schema);

      const result = await resolver({ name: '' }, {}, {} as never);

      expect(result.values).toEqual({});
      expect(result.errors).toHaveProperty('name');
      expect(result.errors.name).toEqual({
        type: 'too_small',
        message: 'エラーメッセージ',
      });
    });

    it('ネストしたパスが正しく設定されること', async () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email({ message: '無効なメールアドレス' }),
        }),
      });
      const resolver = zodResolverWithI18n(schema);

      const result = await resolver({ user: { email: 'invalid' } }, {}, {} as never);

      expect(result.errors).toHaveProperty('user.email');
      expect((result.errors as Record<string, unknown>)['user.email']).toEqual({
        type: 'invalid_format',
        message: '無効なメールアドレス',
      });
    });

    it('同じフィールドに複数のエラーがある場合、最初のエラーのみ含まれること', async () => {
      const schema = z.object({
        password: z.string().min(8, { message: '8文字以上' }).regex(/[A-Z]/, { message: '大文字を含む' }),
      });
      const resolver = zodResolverWithI18n(schema);

      const result = await resolver({ password: 'short' }, {}, {} as never);

      expect(result.errors.password).toEqual({
        type: 'too_small',
        message: '8文字以上',
      });
    });
  });

  describe('validation:プレフィックスの翻訳', () => {
    it('validation:プレフィックスがある場合に翻訳されること', async () => {
      const schema = z.object({
        name: z.string().min(1, { message: 'validation:名前を入力してください' }),
      });
      const resolver = zodResolverWithI18n(schema);

      await resolver({ name: '' }, {}, {} as never);

      // min(1)なのでminimumは1が渡される
      expect(i18n.t).toHaveBeenCalledWith('名前を入力してください', {
        ns: 'validation',
        min: 1,
        max: undefined,
      });
    });

    it('min値がissueから取得されて補間されること', async () => {
      const schema = z.object({
        password: z.string().min(8, { message: 'validation:{{min}}文字以上で入力してください' }),
      });
      const resolver = zodResolverWithI18n(schema);

      const result = await resolver({ password: 'short' }, {}, {} as never);

      expect(i18n.t).toHaveBeenCalledWith('{{min}}文字以上で入力してください', {
        ns: 'validation',
        min: 8,
        max: undefined,
      });
      expect(result.errors.password?.message).toBe('8文字以上で入力してください');
    });

    it('max値がissueから取得されて補間されること', async () => {
      const schema = z.object({
        name: z.string().max(10, { message: 'validation:{{max}}文字以内で入力してください' }),
      });
      const resolver = zodResolverWithI18n(schema);

      const result = await resolver({ name: 'あいうえおかきくけこさ' }, {}, {} as never);

      expect(i18n.t).toHaveBeenCalledWith('{{max}}文字以内で入力してください', {
        ns: 'validation',
        min: undefined,
        max: 10,
      });
      expect(result.errors.name?.message).toBe('10文字以内で入力してください');
    });

    it('validation:プレフィックスがない場合はそのまま返されること', async () => {
      const schema = z.object({
        name: z.string().min(1, { message: '通常のエラーメッセージ' }),
      });
      const resolver = zodResolverWithI18n(schema);

      const result = await resolver({ name: '' }, {}, {} as never);

      expect(i18n.t).not.toHaveBeenCalled();
      expect(result.errors.name?.message).toBe('通常のエラーメッセージ');
    });
  });

  describe('refineによるカスタムバリデーション', () => {
    it('refineのエラーメッセージが正しく処理されること', async () => {
      const schema = z
        .object({
          password: z.string(),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: 'validation:パスワードが一致しません',
          path: ['confirmPassword'],
        });
      const resolver = zodResolverWithI18n(schema);

      const result = await resolver({ password: 'pass1', confirmPassword: 'pass2' }, {}, {} as never);

      expect(result.errors).toHaveProperty('confirmPassword');
      expect(i18n.t).toHaveBeenCalledWith('パスワードが一致しません', {
        ns: 'validation',
        min: undefined,
        max: undefined,
      });
    });
  });
});
