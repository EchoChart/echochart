import CustomRouteView from '@/components/layout/CustomRouteView.vue';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'product',
      name: 'product',
      component: CustomRouteView,
      meta: {
         requiresAuth: true,
         index: -1,
         icon: 'pi pi-barcode',
         requiredPermissions: [
            {
               action: 'select',
               subject: 'products'
            }
         ]
      },
      redirect: { name: 'product-list' },
      children: [
         {
            path: 'list',
            name: 'product-list',
            components: {
               default: () => import('@/views/pages/stock/product/Index.vue'),
               skeleton: () => import('@/views/pages/stock/product/Index.vue')
            },
            meta: {
               visible: false,
               index: -1,
               icon: PrimeIcons.LIST,
               requiredPermissions: [
                  {
                     action: 'select',
                     subject: 'products'
                  }
               ]
            }
         },
         {
            path: ':category?/add',
            name: 'product-add',
            props: true,
            meta: {
               visible: false
            },
            components: {
               default: () => import('@/views/pages/stock/product/Upsert.vue'),
               skeleton: () => import('@/views/pages/stock/product/Upsert.vue')
            }
         },
         {
            path: ':id?/edit',
            name: 'product-edit',
            props: true,
            meta: {
               visible: false
            },
            components: {
               default: () => import('@/views/pages/stock/product/Upsert.vue'),
               skeleton: () => import('@/views/pages/stock/product/Upsert.vue')
            }
         }
      ]
   }
];
