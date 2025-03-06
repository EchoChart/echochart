import deviceRoutes from './device';
import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import sparePartRoutes from './spare-part';
import batteryRoutes from './battery';
import productRoutes from './product';

export default [
   {
      name: 'stock',
      path: 'stock',
      redirect: '/stock/device',
      meta: {
         icon: 'pi pi-warehouse',
         requiredPermissions: [
            {
               action: 'select',
               subject: 'stocks'
            }
         ]
      },
      component: CustomRouteView,
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
