import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import {
  createAuthenticatedClient,
  createServiceClient,
  generateErrorResponse,
  generateJsonResponse,
  isValidUUID,
  parseRequestBody,
  requireMethod,
} from '../_shared/helpers.ts';

interface StartTimerRequest {
  boardId: string;
  durationSeconds: number;
  hideOthersCards: boolean;
}

Deno.serve(async (req) => {
  const methodError = requireMethod(req, 'POST');
  if (methodError) return methodError;

  const result = await createAuthenticatedClient(req);
  if (result instanceof Response) return result;

  const { user } = result;
  const client = createServiceClient();

  const { boardId, durationSeconds, hideOthersCards } = await parseRequestBody<StartTimerRequest>(req);

  // バリデーション
  if (!boardId || !isValidUUID(boardId)) {
    return generateErrorResponse('boardIdは必須です', 400);
  }

  if (!durationSeconds || durationSeconds < 1 || durationSeconds > 3600) {
    return generateErrorResponse('タイマー時間は1秒から3600秒の範囲で指定してください', 400);
  }

  // ボードメンバーシップチェック
  const { data: member, error: memberError } = await client
    .from('board_members')
    .select('id')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (memberError) {
    return generateErrorResponse('メンバー確認に失敗しました', 500);
  }

  if (!member) {
    return generateErrorResponse('このボードのメンバーではありません', 403);
  }

  // 現在のタイマー状態を確認
  const { data: board, error: boardError } = await client
    .from('boards')
    .select('timer_started_at, timer_duration_seconds')
    .eq('id', boardId)
    .single();

  if (boardError || !board) {
    return generateErrorResponse('ボードが見つかりません', 404);
  }

  // 既にタイマーが動作中の場合はエラー（期限切れの場合は許可）
  if (board.timer_started_at && board.timer_duration_seconds) {
    const startTime = new Date(board.timer_started_at).getTime();
    const endTime = startTime + board.timer_duration_seconds * 1000;
    const now = Date.now();

    if (endTime > now) {
      return generateErrorResponse('タイマーは既に動作中です', 400);
    }
  }

  // タイマーを開始
  const now = new Date().toISOString();
  const { error: updateError } = await client
    .from('boards')
    .update({
      timer_started_at: now,
      timer_duration_seconds: durationSeconds,
      timer_hide_others_cards: hideOthersCards ?? false,
      timer_started_by: user.id,
    })
    .eq('id', boardId);

  if (updateError) {
    return generateErrorResponse('タイマーの開始に失敗しました', 500);
  }

  return generateJsonResponse({
    success: true,
    timerStartedAt: now,
    durationSeconds,
    hideOthersCards: hideOthersCards ?? false,
    startedBy: user.id,
  });
});
