import deviceRoutes from './device';
import sparePartRoutes from './spare-part';
import batteryRoutes from './battery';
import productRoutes from './product';

export default [
   {
      name: 'stock',
      path: 'stock',
      meta: {
         icon: 'pi pi-warehouse',
         requiredPermissions: [
            {
               action: 'select',
               subject: 'stocks'
            }
         ]
      },
      components: {
         default: () => import('@/views/pages/stock/Index.vue'),
         skeleton: () => import('@/views/pages/stock/Index.vue')
      },
      children: [
         {
            path: ':category?/add',
            name: 'stock-add',
            props: true,
            meta: {
               visible: false
            },
            components: {
               default: () => import('@/views/pages/stock/Upsert.vue'),
               skeleton: () => import('@/views/pages/stock/Upsert.vue')
            }
         },
         {
            path: ':category?/:id?/edit',
            name: 'stock-edit',
            props: true,
            meta: {
               visible: false
            },
            components: {
               default: () => import('@/views/pages/stock/Upsert.vue'),
               skeleton: () => import('@/views/pages/stock/Upsert.vue')
            }
         },
         ...productRoutes,
         ...deviceRoutes,
         ...sparePartRoutes,
         ...batteryRoutes
      ]
   }
];
