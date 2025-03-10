import CustomRouteView from '@/components/layout/CustomRouteView.vue';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'client',
      component: CustomRouteView,
      meta: {
         visible: true,
         index: -1,
         icon: PrimeIcons.USERS,
         requiresAuth: true
      },
      name: 'client',
      redirect: { name: 'client-list' },
      children: [
         {
            path: 'list',
            name: 'client-list',
            meta: {
               visible: false,
               index: 2,
               icon: PrimeIcons.LIST,
               requiresAuth: true,
               requiredPermissions: [
                  {
                     action: 'read',
                     subject: 'clients'
                  }
               ]
            },
            components: {
               default: () => import('@/views/pages/client/Index.vue'),
               skeleton: () => import('@/views/pages/client/Index.vue')
            }
         },
         {
            path: ':id?/edit',
            name: 'client-edit',
            props: true,
            meta: {
               visible: false
            },
            components: {
               default: () => import('@/views/pages/client/Upsert.vue'),
               skeleton: () => import('@/views/pages/client/Upsert.vue')
            }
         },
         {
            path: 'add',
            name: 'client-add',
            props: true,
            meta: {
               visible: false
            },
            components: {
               default: () => import('@/views/pages/client/Upsert.vue'),
               skeleton: () => import('@/views/pages/client/Upsert.vue')
            }
         }
      ]
   }
];
