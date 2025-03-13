import CustomRouteView from '@/components/layout/CustomRouteView.vue';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'battery',
      name: 'battery',
      component: CustomRouteView,
      meta: {
         requiresAuth: true,
         icon: PrimeIcons.BOLT,
         requiredPermissions: [
            {
               action: 'select',
               subject: 'stock'
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
