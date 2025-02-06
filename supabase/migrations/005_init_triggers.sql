-- Create or replace trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION private.handle_new_user ();

-- Create or replace trigger for updated users
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated AFTER
UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION private.handle_update_user ();

-- Create or replace trigger for user deletions
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted AFTER DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION private.handle_user_delete ();

-- Create or replace trigger to watch changes on permissions
DROP TRIGGER IF EXISTS permissions_trigger ON public.permissions;

CREATE TRIGGER permissions_trigger AFTER INSERT
OR
UPDATE
OR DELETE ON public.permissions FOR EACH ROW EXECUTE FUNCTION private.manage_policies ();