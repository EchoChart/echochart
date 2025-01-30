<script setup>
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
const { navigate, href, route, isActive, isExactActive } = useLink(props);

const isExternalLink = computed(() => {
   return href.value?.startsWith?.('http');
});

const dialogRef = inject('dialogRef', null);
const routeLoading = inject('routeLoading', false);

const contextMenu = ref();
const constextMenuItems = computed(() => {
   return [
      {
         label: i18n.t('open_in_window'),
         route: {
            ...route.value,
            query: {
               ...route.value?.query,
               showDialog: 'center'
            }
         }
      },
      ...props.contextMenuItems
   ];
});

const itemClick = (item) => {
   if (dialogRef) {
      item.query.showDialog = 'center';
   }

   router.push(item);
};
</script>

<template>
   <a v-if="isExternalLink" v-ripple v-bind="$attrs" :href="href" target="_blank">
      <slot />
   </a>
   <router-link v-else v-bind="$props" custom>
      <a
         v-ripple
         v-bind="$attrs"
         :href="href"
         @click.prevent="() => itemClick(route)"
         @contextmenu="(e) => contextMenu.show(e)"
         :disabled="routeLoading"
      >
         <slot v-bind="{ href, navigate, isExactActive, isActive, route }" />
      </a>
   </router-link>
   <ContextMenu v-if="!isExternalLink" ref="contextMenu" :model="constextMenuItems">
      <template #item="{ item, props }">
         <RouterLink v-if="item.route" v-slot="{ href, route }" :to="item.route" custom>
            <a v-ripple :href="href" v-bind="props.action" @click.prevent="() => itemClick(route)">
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
