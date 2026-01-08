import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
export function ErrorFallback(): ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-gray-800">問題が発生しました</h1>
      <p className="mt-2 text-gray-600">予期しないエラーにより操作に失敗しました。もう一度お試しください。</p>
      <Link to="/" className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        ホームに戻る
      </Link>
    </div>
  );
}
