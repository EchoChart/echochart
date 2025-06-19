import batteryRoutes from './battery';
import deviceRoutes from './device';
import productRoutes from './product';
import serviceRoutes from './service';
import sparePartRoutes from './spare-part';

export default [
   {
      name: 'stock',
      path: 'stock',
      meta: {
         label: i18n.t('route.label.stock'),
         icon: 'pi pi-warehouse',
         requiredPermissions: [
            {
               action: 'select',
               subject: 'stock'
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
               label: i18n.t('route.label.add'),
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
               label: i18n.t('route.label.edit'),
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
         ...serviceRoutes,
         ...batteryRoutes
      ]
   }
];
