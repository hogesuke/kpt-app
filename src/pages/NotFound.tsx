import { ReactElement } from 'react';
import { Link } from 'react-router';

export function NotFound(): ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-600">404</h1>
      <p className="mt-4 text-lg text-gray-600">ページが見つかりません</p>
      <Link to="/" className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        ホームに戻る
      </Link>
    </div>
  );
}
