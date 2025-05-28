<script setup></script>

<template>
   <SpeedDial
      :transitionDelay="40"
      direction="right"
      class="custom_table__action-speeddial"
      @mouseleave="(e) => e?.target?.classList?.remove?.('p-speeddial-open')"
      :buttonProps="{
         severity: 'secondary',
         size: 'small',
         rounded: true,
         class: 'custom_table__action-speeddial-button',
         onMouseenter: (e) => e?.target?.parentElement?.classList?.toggle?.('p-speeddial-open')
      }"
      :tooltipOptions="{ position: 'top' }"
   />
</template>

<style lang="scss">
.custom_table {
   &__action-speeddial {
      @apply justify-self-start;

      &-button {
         @apply !w-10 !h-10 self-center;
      }
   }
}
</style>
