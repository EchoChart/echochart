import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { DIALOG_POSITIONS } from '../constants';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'client',
      component: CustomRouteView,
      meta: {
         index: -1,
         icon: PrimeIcons.USERS,
         requiresAuth: true,
         requiredPermissions: [
            {
               action: 'read',
               subject: 'client'
            }
         ],
         contextMenuItems: [
            {
               label: i18n.t('add'),
               route: {
                  name: 'client-add',
                  query: { showDialog: DIALOG_POSITIONS.CENTER }
               }
            }
         ]
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
                     subject: 'client'
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
