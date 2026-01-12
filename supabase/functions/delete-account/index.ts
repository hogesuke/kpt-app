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

interface Transfer {
  boardId: string;
  newOwnerId: string;
}

interface DeleteAccountRequest {
  transfers: Transfer[];
}

Deno.serve(async (req) => {
  const methodError = requireMethod(req, 'DELETE');
  if (methodError) return methodError;

  const result = await createAuthenticatedClient(req);
  if (result instanceof Response) return result;

  const { user } = result;
  const serviceClient = createServiceClient();

  const { transfers = [] } = await parseRequestBody<DeleteAccountRequest>(req);

  // transfersのバリデーション
  for (const transfer of transfers) {
    if (!transfer.boardId || !transfer.newOwnerId) {
      return generateErrorResponse('boardIdとnewOwnerIdは必須です', 400);
    }
    if (!isValidUUID(transfer.boardId) || !isValidUUID(transfer.newOwnerId)) {
      return generateErrorResponse('無効なIDが含まれています', 400);
    }
  }

  // ユーザーが所有するボードを取得
  const { data: ownedBoards, error: boardsError } = await serviceClient.from('boards').select('id, owner_id').eq('owner_id', user.id);

  if (boardsError) {
    return generateErrorResponse('ボード情報の取得に失敗しました', 500);
  }

  const ownedBoardIds = new Set((ownedBoards ?? []).map((b) => b.id));

  // transfersの検証
  for (const transfer of transfers) {
    // ユーザーがボードを所有しているか確認
    if (!ownedBoardIds.has(transfer.boardId)) {
      return generateErrorResponse(`ボード ${transfer.boardId} を所有していません`, 403);
    }

    // 譲渡先がボードのメンバーか確認
    const { data: membership, error: memberError } = await serviceClient
      .from('board_members')
      .select('id')
      .eq('board_id', transfer.boardId)
      .eq('user_id', transfer.newOwnerId)
      .maybeSingle();

    if (memberError) {
      return generateErrorResponse('メンバー情報の確認に失敗しました', 500);
    }

    if (!membership) {
      return generateErrorResponse(`ユーザー ${transfer.newOwnerId} はボード ${transfer.boardId} のメンバーではありません`, 400);
    }
  }

  // 所有権譲渡
  for (const transfer of transfers) {
    // boards.owner_idを更新
    const { error: updateBoardError } = await serviceClient
      .from('boards')
      .update({ owner_id: transfer.newOwnerId })
      .eq('id', transfer.boardId);

    if (updateBoardError) {
      return generateErrorResponse(`ボード ${transfer.boardId} の所有権譲渡に失敗しました`, 500);
    }

    // 新オーナーのroleを'owner'に更新
    const { error: updateRoleError } = await serviceClient
      .from('board_members')
      .update({ role: 'owner' })
      .eq('board_id', transfer.boardId)
      .eq('user_id', transfer.newOwnerId);

    if (updateRoleError) {
      return generateErrorResponse(`ボード ${transfer.boardId} のロール更新に失敗しました`, 500);
    }

    // 譲渡されたボードをownedBoardIdsから除外
    ownedBoardIds.delete(transfer.boardId);
  }

  // 譲渡されないボード（他メンバーがいないボード）を削除
  for (const boardId of ownedBoardIds) {
    const { error: deleteBoardError } = await serviceClient.from('boards').delete().eq('id', boardId);

    if (deleteBoardError) {
      return generateErrorResponse(`ボード ${boardId} の削除に失敗しました`, 500);
    }
  }

  // ユーザー削除
  const { error: deleteUserError } = await serviceClient.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    return generateErrorResponse('アカウントの削除に失敗しました', 500);
  }

  return generateJsonResponse({ success: true, message: 'アカウントを削除しました' });
});
