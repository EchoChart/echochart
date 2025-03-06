import CustomRouteView from '@/components/layout/CustomRouteView.vue';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'device',
      name: 'device',
      component: CustomRouteView,
      meta: {
         requiresAuth: true,
         icon: 'pi pi-headphones',
         requiredPermissions: [
            {
               action: 'select',
               subject: 'stocks'
            }
         ]
      },
      redirect: { name: 'device-list' },
      children: [
         {
            path: 'list',
            name: 'device-list',
            components: {
               default: () => import('@/views/pages/stock/device/Index.vue'),
               skeleton: () => import('@/views/pages/stock/device/Index.vue')
            },
            meta: {
               visible: false,
               index: -1,
               icon: PrimeIcons.LIST,
               requiredPermissions: [
                  {
                     action: 'select',
                     subject: 'stocks'
                  }
               ]
            }
         }
      ]
   }
];
