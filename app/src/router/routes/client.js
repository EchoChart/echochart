import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { DIALOG_POSITIONS } from '../../constants/router';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'client',
      name: 'client',
      component: CustomRouteView,
      meta: {
         label: i18n.t('route.label.client'),
         index: -1,
         icon: PrimeIcons.USERS,
         requiresAuth: true,
         requiredPermissions: [
            {
               action: 'read',
               subject: 'client'
            }
         ]
      },
      redirect: { name: 'client-list' },
      children: [
         {
            path: 'list',
            name: 'client-list',
            meta: {
               label: i18n.t('route.label.list'),
               icon: PrimeIcons.LIST,
               requiresAuth: true,
               requiredPermissions: [
                  {
                     action: 'read',
                     subject: 'client'
                  }
               ],
               contextMenuItems: [
                  {
                     label: i18n.t('action.add'),
                     route: {
                        name: 'client-manage',
                        query: { showDialog: DIALOG_POSITIONS.CENTER }
                     }
                  }
               ]
            },
            components: {
               default: () => import('@/views/pages/client/Index.vue'),
               skeleton: () => import('@/views/pages/client/Index.vue')
            }
         },
         {
            path: ':id?/manage/:tab?',
            name: 'client-manage',
            props: true,
            meta: {
               label: i18n.t('route.label.manage-client'),
               visible: false
            },
            components: {
               default: () => import('@/views/pages/client/upsert/Index.vue'),
               skeleton: () => import('@/views/pages/client/upsert/Index.vue')
            },
            children: [
               {
                  path: 'general',
                  name: 'manage-client-general',
                  props: true,
                  meta: {
                     label: i18n.t('route.label.client-general-info'),
                     icon: PrimeIcons.USER,
                     visible: false
                  },
                  components: {
                     default: () => import('@/views/pages/client/upsert/tabs/General.vue'),
                     skeleton: () => import('@/views/pages/client/upsert/tabs/General.vue')
                  }
               },
               {
                  path: 'address',
                  name: 'manage-client-address',
                  props: true,
                  meta: {
                     label: i18n.t('route.label.client-addresses'),
                     icon: 'pi pi-address-book',
                     visible: false
                  },
                  components: {
                     default: () => import('@/views/pages/client/upsert/tabs/Address.vue'),
                     skeleton: () => import('@/views/pages/client/upsert/tabs/Address.vue')
                  }
               }
            ]
         },
         {
            path: 'address',
            name: 'client-address',
            component: CustomRouteView,
            meta: {
               label: i18n.t('route.label.address'),
               icon: 'pi pi-address-book',
               requiresAuth: true,
               contextMenuItems: computed(() => {
                  const { ability } = useAuthStore();
                  if (ability.can('create', 'address') || ability.can('modify', 'address'))
                     return [
                        {
                           label: i18n.t('router.action.manage-addresses'),
                           route: {
                              name: 'address-list',
                              query: { showDialog: DIALOG_POSITIONS.CENTER }
                           }
                        }
                     ];
                  return null;
               })
            },
            redirect: { name: 'client-address-list' },
            children: [
               {
                  path: 'list',
                  name: 'client-address-list',
                  meta: {
                     label: i18n.t('route.label.list'),
                     visible: false,
                     index: 2,
                     icon: PrimeIcons.LIST,
                     requiredPermissions: [
                        {
                           action: 'read',
                           subject: 'address'
                        }
                     ]
                  },
                  components: {
                     default: () => import('@/views/pages/client/address/Index.vue'),
                     skeleton: () => import('@/views/pages/client/address/Index.vue')
                  }
               }
            ]
         }
      ]
   }
];
