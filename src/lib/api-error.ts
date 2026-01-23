/**
 * API呼び出しでエラーが発生した場合にスローされるエラークラス
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}
