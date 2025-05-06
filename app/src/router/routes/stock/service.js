import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { DIALOG_POSITIONS } from '@/constants/router';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'service',
      name: 'service',
      component: CustomRouteView,
      meta: {
         index: Infinity,
         requiresAuth: true,
         icon: PrimeIcons.FILE,
         requiredPermissions: [
            {
               action: 'select',
               subject: 'stock'
            }
         ],
         contextMenuItems: [
            {
               label: i18n.t('add'),
               route: {
                  name: 'stock-add',
                  query: { showDialog: DIALOG_POSITIONS.CENTER },
                  params: {
                     category: 'service'
                  }
               }
            }
         ]
      },
      redirect: { name: 'service-list' },
      children: [
         {
            path: 'list',
            name: 'service-list',
            components: {
               default: () => import('@/views/pages/stock/service/Index.vue'),
               skeleton: () => import('@/views/pages/stock/service/Index.vue')
            },
            meta: {
               visible: false,
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
