import CustomRouteView from '@/components/layout/CustomRouteView.vue';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'spare-part',
      name: 'spare-part',
      component: CustomRouteView,
      meta: {
         requiresAuth: true,
         icon: PrimeIcons.WRENCH,
         requiredPermissions: [
            {
               action: 'select',
               subject: 'stocks'
            }
         ]
      },
      redirect: { name: 'spare-part-list' },
      children: [
         {
            path: 'list',
            name: 'spare-part-list',
            components: {
               default: () => import('@/views/pages/stock/spare-part/Index.vue'),
               skeleton: () => import('@/views/pages/stock/spare-part/Index.vue')
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
