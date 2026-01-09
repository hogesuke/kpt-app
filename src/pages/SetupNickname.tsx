import { zodResolver } from '@hookform/resolvers/zod';
import { ReactElement, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { CharacterCounter } from '@/components/ui/CharacterCounter';
import { updateProfile } from '@/lib/kpt-api';
import { nicknameSchema, NicknameFormData } from '@/lib/schemas';
import { useAuthStore } from '@/stores/useAuthStore';
import { NICKNAME_MAX_LENGTH } from '@shared/constants';

interface LocationState {
  from?: string;
}

export function SetupNickname(): ReactElement {
  const profile = useAuthStore((state) => state.profile);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const returnTo = state?.from || '/';
  const setProfileStore = useAuthStore((state) => state.setProfile);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NicknameFormData>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: { nickname: '' },
  });

  const nickname = watch('nickname');

  // プロフィールが存在する場合、既存のニックネームを初期値として設定する
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (profile?.nickname && !isInitialized) {
      reset({ nickname: profile.nickname });
      setIsInitialized(true);
    }
  }, [profile, reset, isInitialized]);

  const onSubmit = async (data: NicknameFormData) => {
    try {
      const updatedProfile = await updateProfile(data.nickname);
      setProfileStore(updatedProfile);
      navigate(returnTo, { replace: true });
    } catch {
      setError('root', { message: 'ニックネームの設定に失敗しました。もう一度お試しください。' });
    }
  };

  const isEditing = !!profile?.nickname;

  return (
    <div className="flex h-full items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
            {isEditing ? 'ニックネームの変更' : 'ニックネームの設定'}
          </h2>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            {isEditing ? '新しいニックネームを入力してください' : 'アプリで表示される名前を設定してください'}
          </p>
        </div>
        <div className="rounded-lg bg-white px-8 py-8 shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                  ニックネーム
                </label>
                <CharacterCounter current={nickname.length} max={NICKNAME_MAX_LENGTH} />
              </div>
              <div className="mt-1">
                <input
                  id="nickname"
                  type="text"
                  autoComplete="nickname"
                  {...register('nickname')}
                  className="focus:border-primary focus:ring-primary block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm"
                  placeholder="e.g. Taro"
                  disabled={isSubmitting}
                />
              </div>
              {errors.nickname && <p className="mt-1 text-sm text-red-700">{errors.nickname.message}</p>}
            </div>

            {errors.root && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{errors.root.message}</p>
              </div>
            )}

            <div className={isEditing ? 'flex gap-3' : ''}>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => navigate(returnTo, { replace: true })}
                  disabled={isSubmitting}
                  className="focus:ring-primary flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  キャンセル
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isEditing ? '更新' : '設定'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
