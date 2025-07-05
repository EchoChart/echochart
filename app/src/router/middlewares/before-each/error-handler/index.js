import { CustomAuthError } from '@supabase/supabase-js';

export const ErrorHandlerBeforeEach = async (to, from, next) => {
   const hash = window.location.hash?.substring?.(1);
   if (!hash) return next();

   const params = new URLSearchParams(hash);
   const entries = Array.from(params.entries());

   const hasError = entries.some(([key]) => key.startsWith('error'));

   if (!hasError) return next();

   const error = _fromPairs(entries.filter(([key]) => key.startsWith('error')));

   history.replaceState(null, '', window.location.pathname + window.location.search);

   throw new CustomAuthError(error.error, error.error_code, 400);
};
