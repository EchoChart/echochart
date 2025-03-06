import CustomRouteView from '@/components/layout/CustomRouteView.vue';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'branch',
      component: CustomRouteView,
      meta: {
         index: -1,
         icon: PrimeIcons.BUILDING,
         requiresAuth: true
      },
      name: 'branch',
      redirect: { name: 'branch-role' },
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
            name: 'branch-role',
            component: CustomRouteView,
            redirect: { name: 'branch-role-list' },
            children: [
               {
                  path: 'list',
                  name: 'branch-role-list',
                  meta: {
                     visible: false,
                     index: -1,
                     requiredPermissions: [
                        {
                           action: 'select',
                           subject: 'roles'
                        },
                        {
                           action: 'select',
                           subject: 'role_permissions'
                        }
                     ],
                     icon: PrimeIcons.LIST
                  },
                  components: {
                     default: () => import('@/views/pages/branch/roles/Index.vue'),
                     skeleton: () => import('@/views/pages/branch/roles/Index.vue')
                  }
               },
               {
                  path: 'add',
                  name: 'branch-role-add',
                  meta: {
                     visible: false,
                     icon: PrimeIcons.PLUS,
                     requiredPermissions: [
                        {
                           action: 'create',
                           subject: 'roles'
                        },
                        {
                           action: 'create',
                           subject: 'role_permissions'
                        }
                     ]
                  },
                  components: {
                     default: () => import('@/views/pages/branch/roles/Upsert.vue'),
                     skeleton: () => import('@/views/pages/branch/roles/Upsert.vue')
                  }
               },
               {
                  path: ':id?/edit',
                  name: 'branch-role-edit',
                  props: true,
                  meta: {
                     icon: PrimeIcons.FILE_EDIT,
                     visible: false,
                     requiredPermissions: [
                        {
                           action: 'modify',
                           subject: 'roles'
                        },
                        {
                           action: 'modify',
                           subject: 'role_permissions'
                        }
                     ]
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
