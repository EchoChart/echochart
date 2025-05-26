<script setup>
const props = defineProps({
   element: {
      type: HTMLElement,
      default: null
   }
});

const printElement = async (e, darkMode = false) => {
   if (!_isElement(e)) return;

   const { toggleDarkMode, isDarkTheme } = useLayout();
   const darkTheme = !!isDarkTheme.value;
   let cloned = e.cloneNode(true);

   const beforePrint = () => document.body.classList.add('printing');
   const afterPrint = () => {
      document.body.classList.remove('printing');
   };
   addEventListener('beforeprint', beforePrint, { once: true });
   addEventListener('afterprint', afterPrint, { once: true });

   if (darkTheme !== darkMode) await toggleDarkMode(null, darkMode).finished;

   document.body.insertAdjacentElement('beforeend', cloned);
   cloned.classList.add('printable');
   window.print();

   if (darkTheme !== darkMode) toggleDarkMode(null, !darkMode);

   document.body.removeChild(cloned);
};
</script>

<template>
   <Button
      size="small"
      :icon="PrimeIcons.PRINT"
      variant="outlined"
      severity="info"
      @click="(e) => printElement(props.element || e?.target?.parentElement?.offsetParent)"
   />
</template>
