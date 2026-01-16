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

Deno.serve(async (req) => {
  const methodError = requireMethod(req, 'POST');
  if (methodError) return methodError;

  const result = await createAuthenticatedClient(req);
  if (result instanceof Response) return result;

  const { user } = result;
  const client = createServiceClient();

  const { itemId }: { itemId?: string } = await parseRequestBody(req);

  if (!itemId) {
    return generateErrorResponse('itemIdは必須です', 400);
  }

  if (!isValidUUID(itemId)) {
    return generateErrorResponse('アイテムが見つかりません', 404);
  }

  // アイテムが存在するか確認
  const { data: item, error: itemError } = await client.from('items').select('id, board_id').eq('id', itemId).maybeSingle();

  if (itemError) {
    return generateErrorResponse('アイテム情報の取得に失敗しました', 500);
  }

  if (!item) {
    return generateErrorResponse('アイテムが見つかりません', 404);
  }

  // ユーザーがboard_membersに含まれているかチェック
  const { data: member } = await client
    .from('board_members')
    .select('id')
    .eq('board_id', item.board_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!member) {
    return generateErrorResponse('このボードへのアクセス権限がありません', 403);
  }

  // 既存の投票を確認
  const { data: existingVote, error: voteCheckError } = await client
    .from('item_votes')
    .select('id')
    .eq('item_id', itemId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (voteCheckError) {
    return generateErrorResponse('投票状態の確認に失敗しました', 500);
  }

  let hasVoted: boolean;

  if (existingVote) {
    // 既に投票している場合は投票を解除する
    const { error: deleteError } = await client.from('item_votes').delete().eq('id', existingVote.id);

    if (deleteError) {
      return generateErrorResponse('投票の解除に失敗しました', 500);
    }

    hasVoted = false;
  } else {
    // 投票していない場合は追加する
    const { error: insertError } = await client.from('item_votes').insert({
      item_id: itemId,
      user_id: user.id,
    });

    if (insertError) {
      return generateErrorResponse('投票に失敗しました', 500);
    }

    hasVoted = true;
  }

  // 更新後の投票数を取得する
  const { count, error: countError } = await client.from('item_votes').select('*', { count: 'exact', head: true }).eq('item_id', itemId);

  if (countError) {
    return generateErrorResponse('投票数の取得に失敗しました', 500);
  }

  return generateJsonResponse({
    itemId,
    voteCount: count ?? 0,
    hasVoted,
  });
});
