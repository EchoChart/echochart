<script setup>
import { DIALOG_POSITIONS } from '@/constants/router';
import { RouterLink } from 'vue-router';

/**
 * CustomLink component for internal and external links with context menu support.
 */
defineOptions({
   inheritAttrs: false
});

/** @type {CustomLinkProps} */
const props = defineProps({
   ...RouterLink.props,
   contextMenuItems: {
      default: () => []
   }
});

const router = useRouter();
const { href, route } = useLink(props);

/**
 * Determines if the link is an external link.
 * @type {import('vue').ComputedRef<boolean>}
 */
const isExternalLink = computed(() => {
   return href.value?.startsWith?.('http');
});

/**
 * Reference to the dialog component.
 * @type {import('vue').Ref<null | any>}
 */
const dialogRef = inject('dialogRef', null);

/**
 * Reference to the context menu component.
 * @type {import('vue').Ref<null | any>}
 */
const contextMenu = ref();

/**
 * Computed property for context menu items with additional actions.
 */
const contextMenuItems = computed(() => {
   return [
      {
         label: i18n.t('open_in_window'),
         route: {
            ...route.value,
            query: {
               ...route.value?.query,
               showDialog: DIALOG_POSITIONS.CENTER
            }
         }
      },
      ...(props.contextMenuItems || [])
   ];
});

/**
 * Handles item click in the context menu.
 * @param {import('vue-router').RouteLocationResolvedGeneric} item - The route location object.
 */
const itemClick = (item) => {
   if (dialogRef) {
      item.query.showDialog = DIALOG_POSITIONS.CENTER;
   }

   router.push(item);
};
</script>

<template>
   <a
      v-if="isExternalLink"
      v-ripple
      v-bind="$attrs"
      :href="href"
      target="_blank"
      class="custom_link__external"
   >
      <slot />
   </a>
   <template
      v-else-if="
         route?.meta?.visible ||
         route?.meta?.requiredPermissions?.every?.(({ action, subject }) => $can?.(action, subject))
      "
   >
      <router-link v-bind="props" custom v-slot="{ isExactActive, isActive }">
         <a
            :href="href"
            @click.exact.capture.prevent=""
            @contextmenu="(e) => contextMenu.show(e)"
            @click.ctrl.capture.prevent.stop="
               $router.push({ ...route, query: { showDialog: DIALOG_POSITIONS.CENTER } })
            "
            class="custom_link__internal flex flex-col"
         >
            <slot
               v-bind="{
                  ...$attrs,
                  href,
                  navigate: itemClick.bind(null, route),
                  isExactActive,
                  isActive,
                  route
               }"
            />
         </a>
      </router-link>
      <ContextMenu v-if="!isExternalLink" ref="contextMenu" :model="contextMenuItems">
         <template #item="{ item, props }">
            <RouterLink v-if="item.route" v-slot="{ href, route }" :to="item.route" custom>
               <a
                  v-ripple
                  :href="href"
                  v-bind="props.action"
                  @click.prevent="() => itemClick(route)"
                  class="custom_link__context-menu-item"
               >
                  <span :class="PrimeIcons.ALIGN_CENTER" class="custom_link__icon" />
                  <span class="custom_link__label" v-text="item.label" />
               </a>
            </RouterLink>
            <a
               v-else
               v-ripple
               :href="item.url"
               :target="item.target"
               v-bind="props.action"
               class="custom_link__context-menu-item"
            >
               <span :class="PrimeIcons.ALIGN_CENTER" class="custom_link__icon" />
               <span class="custom_link__label" v-text="item.label" />
            </a>
         </template>
      </ContextMenu>
   </template>
</template>

<style lang="scss">
.custom_link {
   &__external {
      @apply cursor-alias [&>*]:!cursor-alias !important;
   }

   &__internal {
      @apply flex flex-col;
   }

   &__context-menu-item {
      @apply flex items-center gap-4;
   }
}
</style>
