<script setup lang="ts">
import { VNode } from 'vue';

export type StatisticCardProps = {
   title?: string;
   statistic?: string;
   icon?: string;
   iconColor?: string;
   description?: string;
   loading?: boolean;
};

export type StatisticCardSlots<T = any> = {
   header(): VNode[];
   title(): VNode[];
   statistic(): VNode[];
   icon(): VNode[];
   description(): VNode[];
} & {
   [key: string]: VNode[];
};

defineSlots<StatisticCardSlots>();

const props = withDefaults(defineProps<StatisticCardProps>(), {
   loading: false
});
</script>

<template>
   <div class="card statistic-card__container">
      <div class="statistic-card__header">
         <slot name="header" v-bind="props">
            <div class="statistic-card__title-container">
               <span class="statistic-card__title">
                  <Skeleton v-if="loading" width="50%" height="1.5rem" />
                  <slot v-else name="title" v-bind="props">
                     <span v-if="!_isNil(title)" v-text="title" />
                  </slot>
               </span>
               <div class="statistic-card__statistic">
                  <Skeleton v-if="loading" width="80%" height="2rem" />
                  <slot v-else name="statistic" v-bind="props">
                     <span v-if="!_isNil(statistic)" v-text="statistic" />
                  </slot>
               </div>
            </div>
            <div class="statistic-card__icon">
               <Skeleton v-if="loading" width="2.5rem" height="2.5rem" />
               <slot v-else name="icon" v-bind="props">
                  <i :class="icon || PrimeIcons.INFO_CIRCLE" :style="{ color: iconColor }" />
               </slot>
            </div>
         </slot>
      </div>
      <Skeleton v-if="loading" width="100%" height="3rem" />
      <slot v-else name="description" v-bind="props">
         <span
            v-if="!_isNil(description)"
            class="statistic-card__description"
            v-text="description"
         />
      </slot>
   </div>
</template>

<style lang="scss">
.statistic-card {
   &__container {
      @apply mb-0 flex flex-col gap-4 justify-between items-baseline;
   }

   &__header {
      @apply w-full flex justify-between gap-4;
   }

   &__title-container {
      @apply flex-auto min-w-24 flex flex-col gap-4;
   }
   &__title {
      @apply empty:hidden block text-muted-color font-medium;
   }

   &__statistic {
      @apply text-surface-900 dark:text-surface-0 font-medium text-xl;
   }

   &__icon {
      @apply empty:hidden w-[2.5rem] h-[2.5rem] flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border;

      i {
         @apply text-xl;
      }
   }

   &__description {
      @apply empty:hidden text-muted-color;

      &--emphasis {
         @apply text-primary font-medium;
      }
   }
}
</style>
