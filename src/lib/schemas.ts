import { z } from 'zod';

import { BOARD_NAME_MAX_LENGTH, ITEM_TEXT_MAX_LENGTH, NICKNAME_MAX_LENGTH } from '@shared/constants';

export const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(1, 'ニックネームを入力してください')
    .max(NICKNAME_MAX_LENGTH, `${NICKNAME_MAX_LENGTH}文字以内で入力してください`)
    .transform((v) => v.trim()),
});

export const boardNameSchema = z.object({
  name: z
    .string()
    .min(1, 'ボード名を入力してください')
    .max(BOARD_NAME_MAX_LENGTH, `${BOARD_NAME_MAX_LENGTH}文字以内で入力してください`)
    .transform((v) => v.trim()),
});

export const itemTextSchema = z.object({
  text: z
    .string()
    .min(1, 'テキストを入力してください')
    .max(ITEM_TEXT_MAX_LENGTH, `${ITEM_TEXT_MAX_LENGTH}文字以内で入力してください`)
    .transform((v) => v.trim()),
});

export type NicknameFormData = z.infer<typeof nicknameSchema>;
export type BoardNameFormData = z.infer<typeof boardNameSchema>;
export type ItemTextFormData = z.infer<typeof itemTextSchema>;
