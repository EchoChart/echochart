import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { DIALOG_POSITIONS } from '../../constants/router';

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
            path: 'role',
            meta: {
               icon: PrimeIcons.LOCK,
               requiredPermissions: [
                  {
                     action: 'select',
                     subject: 'role'
                  }
               ],
               contextMenuItems: [
                  {
                     label: i18n.t('add'),
                     route: {
                        name: 'branch-role-add',
                        query: { showDialog: DIALOG_POSITIONS.CENTER }
                     }
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
                           subject: 'role'
                        },
                        {
                           action: 'select',
                           subject: 'role_permission'
                        }
                     ],
                     icon: PrimeIcons.LIST
                  },
                  components: {
                     default: () => import('@/views/pages/branch/role/Index.vue'),
                     skeleton: () => import('@/views/pages/branch/role/Index.vue')
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
                           subject: 'role'
                        },
                        {
                           action: 'create',
                           subject: 'role_permission'
                        }
                     ]
                  },
                  components: {
                     default: () => import('@/views/pages/branch/role/Upsert.vue'),
                     skeleton: () => import('@/views/pages/branch/role/Upsert.vue')
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
                           subject: 'role'
                        },
                        {
                           action: 'modify',
                           subject: 'role_permission'
                        }
                     ]
                  },
                  components: {
                     default: () => import('@/views/pages/branch/role/Upsert.vue'),
                     skeleton: () => import('@/views/pages/branch/role/Upsert.vue')
                  }
               }
            ]
         }
      ]
   }
];
