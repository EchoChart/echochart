<script setup></script>

<template>
   <SpeedDial
      :transitionDelay="40"
      direction="right"
      class="justify-self-start"
      @mouseleave="(e) => e?.target?.classList?.remove?.('p-speeddial-open')"
      :buttonProps="{
         severity: 'secondary',
         size: 'small',
         rounded: true,
         class: '!w-10 !h-10 self-center',
         onMouseenter: (e) => e?.target?.parentElement?.classList?.toggle?.('p-speeddial-open')
      }"
      :tooltipOptions="{ position: 'top' }"
   />
</template>
