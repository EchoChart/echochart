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
         requiredPermissions: [
            {
               action: 'select',
               subject: 'tenants'
            }
         ]
      },
      name: 'branch',
      redirect: { name: 'branch-roles' },
      children: [
         {
            path: 'roles',
            meta: {
               icon: PrimeIcons.LOCK,
               requiredPermissions: [
                  {
                     action: 'select',
                     subject: 'roles'
                  }
               ]
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
                     icon: PrimeIcons.PLUS,
                     requiredPermissions: [
                        {
                           action: 'select',
                           subject: 'role_permissions'
                        },
                        { action: 'insert', subject: 'roles' }
                     ]
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
