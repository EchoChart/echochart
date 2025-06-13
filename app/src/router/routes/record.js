import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { DIALOG_POSITIONS } from '@/constants/router';

/**
 * @type {import('vue-router').RouteRecordNormalized[]}
 */
export default [
   {
      path: i18n.t('record'),
      component: CustomRouteView,
      meta: {
         icon: PrimeIcons.FOLDER,
         requiresAuth: true,
         requiredPermissions: [
            {
               action: 'read',
               subject: 'record'
            }
         ],
         contextMenuItems: [
            {
               label: i18n.t('add'),
               route: {
                  name: 'record-add',
                  query: { showDialog: DIALOG_POSITIONS.CENTER }
               }
            }
         ]
      },
      name: 'record',
      redirect: { name: 'record-list' },
      children: [
         {
            path: ':record_type?',
            name: 'record-list',
            components: {
               default: () => import('@/views/pages/record/index.vue'),
               skeleton: () => import('@/views/pages/record/index.vue')
            },
            meta: {
               icon: PrimeIcons.FOLDER,
               visible: false
            }
         },
         {
            path: 'add',
            name: 'record-add',
            props: true,
            meta: {
               visible: false,
               requiredPermissions: [
                  {
                     action: 'create',
                     subject: 'record'
                  }
               ]
            },
            components: {
               default: () => import('@/views/pages/record/upsert/index.vue'),
               skeleton: () => import('@/views/pages/record/upsert/index.vue')
            }
         },
         {
            path: ':id?/edit',
            name: 'record-edit',
            props: true,
            meta: {
               visible: false,
               requiredPermissions: [
                  {
                     action: 'read',
                     subject: 'record'
                  },
                  {
                     action: 'modify',
                     subject: 'record'
                  }
               ]
            },
            components: {
               default: () => import('@/views/pages/record/upsert/index.vue'),
               skeleton: () => import('@/views/pages/record/upsert/index.vue')
            }
         }
      ]
   }
];
