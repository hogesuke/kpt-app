DROP POLICY IF EXISTS "Users can view their memberships" ON public.board_members;
DROP POLICY IF EXISTS "Service and authenticated users can insert" ON public.board_members;
DROP POLICY IF EXISTS "Owners can remove members from their boards" ON public.board_members;

REVOKE ALL ON public.board_members FROM anon, authenticated;

GRANT ALL ON public.board_members TO service_role;

ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_all_access" ON public.board_members FOR ALL USING (false);
