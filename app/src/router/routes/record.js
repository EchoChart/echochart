import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { DIALOG_POSITIONS } from '@/constants/router';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'record',
      component: CustomRouteView,
      meta: {
         icon: PrimeIcons.FOLDER,
         requiresAuth: true,
         requiredPermissions: [
            {
               action: 'read',
               subject: 'record'
            }
         ]
      },
      name: 'record',
      redirect: { name: 'sales' },
      children: [
         {
            path: 'sales',
            name: 'sales',
            component: CustomRouteView,
            redirect: { name: 'sales-list' },
            meta: {
               icon: PrimeIcons.DOLLAR,
               contextMenuItems: [
                  {
                     label: i18n.t('add'),
                     route: {
                        name: 'sales-add',
                        query: { showDialog: DIALOG_POSITIONS.CENTER }
                     }
                  }
               ]
            },
            children: [
               {
                  path: 'list',
                  name: 'sales-list',
                  meta: {
                     visible: false,
                     requiresAuth: true,
                     requiredPermissions: [
                        {
                           action: 'read',
                           subject: 'record'
                        }
                     ]
                  },
                  components: {
                     default: () => import('@/views/pages/record/sales/Index.vue'),
                     skeleton: () => import('@/views/pages/record/sales/Index.vue')
                  }
               },
               {
                  path: 'add',
                  name: 'sales-add',
                  props: true,
                  meta: {
                     visible: false,
                     requiredPermissions: [
                        {
                           action: 'create',
                           subject: 'record'
                        }
                     ]
                  },
                  components: {
                     default: () => import('@/views/pages/record/sales/upsert/Index.vue'),
                     skeleton: () => import('@/views/pages/record/sales/upsert/Index.vue')
                  }
               },
               {
                  path: ':id?/edit',
                  name: 'sales-edit',
                  props: true,
                  meta: {
                     visible: false,
                     requiredPermissions: [
                        {
                           action: 'read',
                           subject: 'record'
                        },
                        {
                           action: 'modify',
                           subject: 'record'
                        }
                     ]
                  },
                  components: {
                     default: () => import('@/views/pages/record/sales/upsert/Index.vue'),
                     skeleton: () => import('@/views/pages/record/sales/upsert/Index.vue')
                  }
               }
            ]
         }
      ]
   }
];
