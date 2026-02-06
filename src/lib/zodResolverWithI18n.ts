import i18n from 'i18next';
import { FieldErrors, FieldValues, Resolver, ResolverResult } from 'react-hook-form';
import { z } from 'zod';

/**
 * react-hook-form用のカスタムzodResolver
 * validation:プレフィックスを持つエラーメッセージを翻訳し、{{min}}/{{max}}を補間する
 */
export function zodResolverWithI18n<TOutput extends FieldValues>(schema: z.ZodSchema<TOutput>): Resolver<TOutput> {
  return async (values): Promise<ResolverResult<TOutput>> => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, { type: string; message: string }> = {};

    for (const issue of result.error.issues) {
      const path = issue.path.join('.');

      if (path && !errors[path]) {
        let message = issue.message;

        // validation:プレフィックスがある場合は翻訳
        if (message.startsWith('validation:')) {
          const key = message.slice('validation:'.length);
          const min = 'minimum' in issue ? issue.minimum : undefined;
          const max = 'maximum' in issue ? issue.maximum : undefined;
          message = i18n.t(key, { ns: 'validation', min, max });
        }

        errors[path] = {
          type: issue.code,
          message,
        };
      }
    }

    return { values: {}, errors: errors as FieldErrors<TOutput> };
  };
}
