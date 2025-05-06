<script setup>
const props = defineProps({
   src: {
      type: String
   },
   placeholder: {
      type: String,
      required: true
   },
   size: {
      type: String || Number,
      default: '100%'
   },
   backgroundColor: {
      type: String,
      default: null
   },
   textColor: {
      type: String,
      default: null
   }
});

const { getPrimaryColor, getSurfaceColor, isDarkTheme } = useLayout();

const firstLetters = computed(() => {
   const words = props.placeholder?.split?.(' ');
   if (words?.length >= 2) {
      return words
         .slice(0, 2)
         .map((word) => word.charAt(0).toUpperCase())
         .join('');
   } else {
      return words.join('').slice(0, 2).toUpperCase();
   }
});

const bg = computed(() => props.backgroundColor || getPrimaryColor.value?.['500']);
const color = computed(
   () => props.textColor || getSurfaceColor.value?.[isDarkTheme.value ? '700' : '200']
);
const label = computed(() => firstLetters.value || '♥');
</script>

<template>
   <Image>
      <template #image="slotProps">
         <img v-if="src" :src :alt="placeholder" v-bind="slotProps" />
         <svg
            v-else
            :width="size"
            :height="size"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            v-bind="slotProps"
         >
            <rect width="100%" height="100%" :fill="bg" />
            <text
               x="50%"
               y="50%"
               dominant-baseline="middle"
               text-anchor="middle"
               :fill="color"
               font-size="40"
               class="font-[inherit] font-bold"
            >
               {{ label }}
            </text>
         </svg>
      </template>
      <template #original="slotProps">
         <img v-if="src" :src :alt="placeholder" v-bind="slotProps" />
         <svg
            v-else
            :width="size"
            :height="size"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            v-bind="slotProps"
         >
            <rect width="100%" height="100%" :fill="bg" />
            <text
               x="50%"
               y="50%"
               dominant-baseline="middle"
               text-anchor="middle"
               :fill="color"
               font-size="40"
               class="font-[inherit] font-bold"
            >
               {{ label }}
            </text>
         </svg>
      </template>
   </Image>
</template>
