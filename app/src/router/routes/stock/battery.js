import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { DIALOG_POSITIONS } from '@/constants/router';

/**
 * @type {import('vue-router').RouteLocation[]}
 */

export default [
   {
      path: 'battery',
      name: 'battery',
      component: CustomRouteView,
      meta: {
         label: i18n.t('route.label.battery'),
         requiresAuth: true,
         icon: PrimeIcons.BOLT,
         requiredPermissions: [
            {
               action: 'select',
               subject: 'stock'
            }
         ],
         contextMenuItems: [
            {
               label: i18n.t('action.add'),
               route: {
                  name: 'stock-add',
                  query: { showDialog: DIALOG_POSITIONS.CENTER },
                  params: {
                     category: 'battery'
                  }
               }
            }
         ]
      },
      redirect: { name: 'battery-list' },
      children: [
         {
            path: 'list',
            name: 'battery-list',
            components: {
               default: () => import('@/views/pages/stock/battery/Index.vue'),
               skeleton: () => import('@/views/pages/stock/battery/Index.vue')
            },
            meta: {
               visible: false,
               label: i18n.t('route.label.battery_list'),
               index: -1,
               icon: PrimeIcons.LIST,
               requiredPermissions: [
                  {
                     action: 'select',
                     subject: 'stock'
                  }
               ]
            }
         }
      ]
   }
];
