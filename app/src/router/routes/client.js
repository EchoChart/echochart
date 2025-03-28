import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { DIALOG_POSITIONS } from '../../constants/router';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'client',
      component: CustomRouteView,
      meta: {
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
      name: 'client',
      redirect: { name: 'client-list' },
      children: [
         {
            path: 'list',
            name: 'client-list',
            meta: {
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
                     label: i18n.t('add'),
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
               visible: false
            },
            components: {
               default: () => import('@/views/pages/client/upsert/Index.vue'),
               skeleton: () => import('@/views/pages/client/upsert/Index.vue')
            },
            children: [
               {
                  path: 'general',
                  name: 'client-manage-general',
                  props: true,
                  meta: {
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
                  name: 'client-manage-address',
                  props: true,
                  meta: {
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
               icon: 'pi pi-address-book',
               requiresAuth: true,
               contextMenuItems: computed(() => {
                  const { ability } = useAuthStore();
                  if (ability.can('create', 'address') || ability.can('modify', 'address'))
                     return [
                        {
                           label: i18n.t('manage_addresses'),
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
