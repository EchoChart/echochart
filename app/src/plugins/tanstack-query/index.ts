import {
   experimental_createQueryPersister,
   StoragePersisterOptions
} from '@tanstack/query-persist-client-core';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/vue-query';
import { del, entries, get, set } from 'idb-keyval';

export const queryCache = new QueryCache();
export const mutationCache = new MutationCache();

const persisterOptions: StoragePersisterOptions = {
   storage: {
      getItem: get,
      setItem: set,
      removeItem: del,
      entries
   },
   filters: {
      predicate(query) {
         return !query.isStale();
      }
   },
   prefix: 'echochart'
};

export const clientPersister: ReturnType<typeof experimental_createQueryPersister> =
   experimental_createQueryPersister(persisterOptions);

export const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         persister: clientPersister.persisterFn
      }
   }
});
