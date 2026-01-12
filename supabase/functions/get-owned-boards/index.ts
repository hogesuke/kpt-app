import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import {
  createAuthenticatedClient,
  createServiceClient,
  generateErrorResponse,
  generateJsonResponse,
  requireMethod,
} from '../_shared/helpers.ts';

Deno.serve(async (req) => {
  const methodError = requireMethod(req, 'GET');
  if (methodError) return methodError;

  const result = await createAuthenticatedClient(req);
  if (result instanceof Response) return result;

  const { user } = result;
  const client = createServiceClient();

  // ユーザーが所有するボードを取得
  const { data: ownedBoards, error: boardsError } = await client
    .from('boards')
    .select('id, name, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (boardsError) {
    return generateErrorResponse('所有ボード情報の取得に失敗しました', 500);
  }

  if (!ownedBoards || ownedBoards.length === 0) {
    return generateJsonResponse({ boards: [] });
  }

  // 各ボードの自分以外のメンバー情報を取得
  const boardIds = ownedBoards.map((b) => b.id);

  const { data: membersData, error: membersError } = await client
    .from('board_members')
    .select('board_id, user_id')
    .in('board_id', boardIds)
    .neq('user_id', user.id);

  if (membersError) {
    return generateErrorResponse('メンバー情報の取得に失敗しました', 500);
  }

  // メンバーのプロフィール情報を取得
  const memberUserIds = [...new Set((membersData ?? []).map((m) => m.user_id))];
  let profilesMap: Record<string, string | null> = {};

  if (memberUserIds.length > 0) {
    const { data: profilesData, error: profilesError } = await client.from('profiles').select('id, nickname').in('id', memberUserIds);

    if (profilesError) {
      return generateErrorResponse('プロフィール情報の取得に失敗しました', 500);
    }

    profilesMap = (profilesData ?? []).reduce(
      (acc, p) => {
        acc[p.id] = p.nickname;
        return acc;
      },
      {} as Record<string, string | null>
    );
  }

  // ボードごとにメンバー情報をグループ化
  const membersByBoard: Record<string, Array<{ userId: string; nickname: string | null }>> = {};

  for (const member of membersData ?? []) {
    if (!membersByBoard[member.board_id]) {
      membersByBoard[member.board_id] = [];
    }
    membersByBoard[member.board_id].push({
      userId: member.user_id,
      nickname: profilesMap[member.user_id] ?? null,
    });
  }

  const boards = ownedBoards.map((board) => ({
    id: board.id,
    name: board.name,
    members: membersByBoard[board.id] ?? [],
    hasOtherMembers: (membersByBoard[board.id] ?? []).length > 0,
  }));

  return generateJsonResponse({ boards });
});
