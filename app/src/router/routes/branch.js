import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import router from '..';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'branch',
      component: CustomRouteView,
      meta: {
         index: 0,
         icon: PrimeIcons.BUILDING,
         requiresAuth: true,
         visible: computed(() => {
            const { isSignedIn } = storeToRefs(useAuthStore());
            return isSignedIn?.value;
         })
      },
      name: 'branch',
      redirect: { name: 'branch-roles' },
      children: [
         {
            path: 'roles',
            meta: {
               icon: PrimeIcons.LOCK
            },
            name: 'branch-roles',
            component: CustomRouteView,
            redirect: { name: 'branch-roles-list' },
            children: [
               {
                  path: 'list',
                  name: 'branch-roles-list',
                  meta: {
                     index: -1,
                     icon: PrimeIcons.LIST
                  },
                  components: {
                     default: () => import('@/views/pages/branch/roles/Index.vue'),
                     skeleton: () => import('@/views/pages/branch/roles/Index.vue')
                  }
               },
               {
                  path: 'add',
                  name: 'branch-roles-add',
                  meta: {
                     icon: PrimeIcons.PLUS
                  },
                  components: {
                     default: () => import('@/views/pages/branch/roles/Upsert.vue'),
                     skeleton: () => import('@/views/pages/branch/roles/Upsert.vue')
                  }
               },
               {
                  path: ':id?/edit',
                  name: 'branch-roles-edit',
                  props: true,
                  meta: {
                     icon: PrimeIcons.PENCIL,
                     visible: false
                  },
                  beforeEnter(to) {
                     const id = to.params?.id;
                     if (_isString(id) && !_isEmpty(id)) return true;
                     router.replace({ name: 'branch-roles-add' });
                  },
                  components: {
                     default: () => import('@/views/pages/branch/roles/Upsert.vue'),
                     skeleton: () => import('@/views/pages/branch/roles/Upsert.vue')
                  }
               }
            ]
         }
      ]
   }
];
