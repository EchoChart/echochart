<script setup></script>

<template>
   <SpeedDial
      :transitionDelay="40"
      direction="right"
      class="custom-table__action-speeddial-container"
      @mouseleave="(e) => e?.target?.classList?.remove?.('p-speeddial-open')"
      :buttonProps="{
         severity: 'secondary',
         size: 'small',
         rounded: true,
         class: 'custom-table__action-speeddial-button',
         onMouseenter: (e) => e?.target?.parentElement?.classList?.toggle?.('p-speeddial-open')
      }"
      :tooltipOptions="{ position: 'top' }"
   />
</template>

<style lang="scss">
.custom-table {
   &__action-speeddial {
      &-container {
         @apply justify-self-start;
      }

      &-button {
         @apply !w-10 !h-10 self-center;
      }
   }
}
</style>
