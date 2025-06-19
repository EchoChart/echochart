import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { DIALOG_POSITIONS } from '@/constants/router';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'address',
      name: 'address',
      component: CustomRouteView,
      meta: {
         label: i18n.t('route.label.address'),
         index: -1,
         visible: false,
         icon: 'pi pi-address-book',
         requiresAuth: true,
         requiredPermissions: [
            {
               action: 'read',
               subject: 'address'
            }
         ],
         contextMenuItems: [
            {
               label: i18n.t('action.add'),
               route: {
                  name: 'address-add',
                  query: { showDialog: DIALOG_POSITIONS.CENTER }
               }
            }
         ]
      },
      redirect: { name: 'address-list' },
      children: [
         {
            path: 'list',
            name: 'address-list',
            meta: {
               label: i18n.t('route.label.list'),
               visible: false,
               index: 2,
               icon: PrimeIcons.LIST,
               requiresAuth: true
            },
            components: {
               default: () => import('@/views/pages/address/Index.vue'),
               skeleton: () => import('@/views/pages/address/Index.vue')
            }
         },
         {
            path: ':id?/edit',
            name: 'address-edit',
            props: true,
            meta: {
               label: i18n.t('route.label.edit'),
               visible: false,
               requiredPermissions: [
                  {
                     action: 'read',
                     subject: 'address'
                  },
                  {
                     action: 'modify',
                     subject: 'address'
                  }
               ]
            },
            components: {
               default: () => import('@/views/pages/address/Upsert.vue'),
               skeleton: () => import('@/views/pages/address/Upsert.vue')
            }
         },
         {
            path: 'add',
            name: 'address-add',
            props: true,
            meta: {
               label: i18n.t('route.label.add'),
               visible: false,
               requiredPermissions: [
                  {
                     action: 'create',
                     subject: 'address'
                  }
               ]
            },
            components: {
               default: () => import('@/views/pages/address/Upsert.vue'),
               skeleton: () => import('@/views/pages/address/Upsert.vue')
            }
         }
      ]
   }
];
