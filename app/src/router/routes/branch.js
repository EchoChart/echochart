import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { DIALOG_POSITIONS } from '../../constants/router';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'branch',
      name: 'branch',
      component: CustomRouteView,
      meta: {
         label: i18n.t('route.label.branch'),
         index: -1,
         icon: PrimeIcons.BUILDING,
         requiresAuth: true
      },
      components: {
         default: () => import('@/views/pages/branch/Index.vue'),
         skeleton: () => import('@/views/pages/branch/Index.vue')
      },
      children: [
         {
            path: 'role',
            name: 'branch-role',
            meta: {
               label: i18n.t('route.label.branch-role'),
               icon: PrimeIcons.LOCK,
               requiredPermissions: [
                  {
                     action: 'select',
                     subject: 'role'
                  }
               ],
               contextMenuItems: [
                  {
                     label: i18n.t('action.add'),
                     route: {
                        name: 'branch-role-add',
                        query: { showDialog: DIALOG_POSITIONS.CENTER }
                     }
                  }
               ]
            },
            component: CustomRouteView,
            redirect: { name: 'branch-role-list' },
            children: [
               {
                  path: 'list',
                  name: 'branch-role-list',
                  meta: {
                     label: i18n.t('route.label.list'),
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
                     label: i18n.t('route.label.add'),
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
                     label: i18n.t('route.label.edit'),
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
         },
         {
            path: 'audit-log',
            name: 'branch-audit-log',
            meta: {
               label: i18n.t('route.label.audit-logs'),
               icon: PrimeIcons.HISTORY,
               requiredPermissions: [
                  {
                     action: 'select',
                     subject: 'audit_log'
                  }
               ]
            },
            component: CustomRouteView,
            redirect: { name: 'branch-audit-log-list' },
            children: [
               {
                  path: 'list',
                  name: 'branch-audit-log-list',
                  meta: {
                     label: i18n.t('route.label.list'),
                     visible: false,
                     index: -1,
                     requiredPermissions: [
                        {
                           action: 'select',
                           subject: 'audit_log'
                        }
                     ],
                     icon: PrimeIcons.LIST
                  },
                  components: {
                     default: () => import('@/views/pages/branch/audit_log/Index.vue'),
                     skeleton: () => import('@/views/pages/branch/audit_log/Index.vue')
                  }
               }
            ]
         }
      ]
   }
];
