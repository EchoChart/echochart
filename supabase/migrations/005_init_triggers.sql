-- Create or replace trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION private.handle_new_user ();

-- Create or replace trigger for user deletions
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
AFTER DELETE ON auth.users FOR EACH ROW
EXECUTE FUNCTION private.handle_user_delete ();

-- Create or replace Trigger for user_display_name_default
DROP TRIGGER IF EXISTS user_display_name_default ON public.users;

CREATE TRIGGER user_display_name_default BEFORE INSERT
OR
UPDATE ON public.users FOR EACH ROW
EXECUTE FUNCTION private.user_display_name_default ();

-- Create or replace trigger to watch changes on app_permissions
DROP TRIGGER IF EXISTS app_permissions_trigger ON public.app_permissions;

CREATE TRIGGER app_permissions_trigger
AFTER INSERT
OR
UPDATE
OR DELETE ON public.app_permissions FOR EACH ROW
EXECUTE FUNCTION private.manage_policies ();
