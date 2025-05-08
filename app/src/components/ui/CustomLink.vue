<script setup>
import { DIALOG_POSITIONS } from '@/constants/router';
import { RouterLink } from 'vue-router';

defineOptions({
   inheritAttrs: false
});

const props = defineProps({
   ...RouterLink.props,
   contextMenuItems: {
      type: Array,
      default: () => []
   }
});

const router = useRouter();
const { href, route } = useLink(props);

const isExternalLink = computed(() => {
   return href.value?.startsWith?.('http');
});

const dialogRef = inject('dialogRef', null);

const contextMenu = ref();
const constextMenuItems = computed(() => {
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

const itemClick = (item) => {
   if (dialogRef) {
      item.query.showDialog = DIALOG_POSITIONS.CENTER;
   }

   router.push(item);
};
</script>

<template>
   <a v-if="isExternalLink" v-ripple v-bind="$attrs" :href="href" target="_blank">
      <slot />
   </a>
   <template
      v-else-if="
         route?.meta?.visible ||
         route?.meta?.requiredPermissions?.every?.(({ action, subject }) => $can?.(action, subject))
      "
   >
      <router-link v-bind="$props" custom v-slot="{ isExactActive, isActive }">
         <span
            @contextmenu="(e) => contextMenu.show(e)"
            @click.ctrl.capture.stop="
               $router.push({ ...route, query: { showDialog: DIALOG_POSITIONS.CENTER } })
            "
            class="!cursor-alias [&>*]:!cursor-alias flex flex-col"
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
         </span>
      </router-link>
      <ContextMenu v-if="!isExternalLink" ref="contextMenu" :model="constextMenuItems">
         <template #item="{ item, props }">
            <RouterLink v-if="item.route" v-slot="{ href, route }" :to="item.route" custom>
               <a
                  v-ripple
                  :href="href"
                  v-bind="props.action"
                  @click.prevent="() => itemClick(route)"
               >
                  <span :class="item.icon" />
                  <span class="ml-2" v-text="item.label" />
               </a>
            </RouterLink>
            <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
               <span :class="item.icon" />
               <span class="ml-2" v-text="item.label" />
            </a>
         </template>
      </ContextMenu>
   </template>
</template>
