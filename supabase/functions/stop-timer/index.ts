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

interface StopTimerRequest {
  boardId: string;
}

Deno.serve(async (req) => {
  const methodError = requireMethod(req, 'POST');
  if (methodError) return methodError;

  const result = await createAuthenticatedClient(req);
  if (result instanceof Response) return result;

  const { user } = result;
  const client = createServiceClient();

  const { boardId } = await parseRequestBody<StopTimerRequest>(req);

  // バリデーション
  if (!boardId || !isValidUUID(boardId)) {
    return generateErrorResponse('boardIdは必須です', 400);
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

  // タイマーを停止（全カラムをNULL/デフォルトに戻す）
  const { error: updateError } = await client
    .from('boards')
    .update({
      timer_started_at: null,
      timer_duration_seconds: null,
      timer_hide_others_cards: false,
      timer_started_by: null,
    })
    .eq('id', boardId);

  if (updateError) {
    return generateErrorResponse('タイマーの停止に失敗しました', 500);
  }

  return generateJsonResponse({ success: true });
});
