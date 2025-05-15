import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/vue-query';
import { del, entries, get, set } from 'idb-keyval';

export const queryClient = new QueryClient();
export const queryCache = new QueryCache();
export const mutationCache = new MutationCache();
/**
 * @type {import('@tanstack/query-persist-client-core').StoragePersisterOptions}
 */
const persisterOptions = {
   storage: {
      getItem: get,
      setItem: set,
      removeItem: del,
      entries
   },
   prefix: 'echochart'
};
/**
 * @type {ReturnType<import('@tanstack/query-persist-client-core').experimental_createQueryPersister>}
 */
export const clientPersister = experimental_createQueryPersister(persisterOptions);
