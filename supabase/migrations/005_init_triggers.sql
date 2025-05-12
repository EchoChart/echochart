-- Create or replace trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION private.handle_new_user ();

-- Create or replace trigger for updated user
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
AFTER
UPDATE ON auth.users FOR EACH ROW
EXECUTE FUNCTION private.handle_update_user ();

-- Create or replace trigger for user deletions
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
AFTER DELETE ON auth.users FOR EACH ROW
EXECUTE FUNCTION private.handle_user_delete ();

-- Create or replace trigger to watch changes on permission
DROP TRIGGER IF EXISTS permission_trigger ON public.permission;

CREATE TRIGGER permission_trigger
AFTER INSERT
OR
UPDATE
OR DELETE ON public.permission FOR EACH ROW
EXECUTE FUNCTION private.manage_policies ();

-- Create a new trigger that will be executed after inserting or updating the audit config table
DROP TRIGGER IF EXISTS trg_audit_config ON private.audit_config;

CREATE TRIGGER trg_audit_config
AFTER INSERT
OR
UPDATE
OR DELETE ON private.audit_config FOR EACH STATEMENT
EXECUTE FUNCTION private.audit_sync_triggers_wrapper ();

CREATE TRIGGER before_record_insert_update BEFORE INSERT
OR
UPDATE ON public.record FOR EACH ROW
EXECUTE FUNCTION validate_record_amount ();