<template>
   <div class="not_found_page__container">
      <div class="not_found_page__content">
         <div class="not_found_page__gradient-bg">
            <div class="not_found_page__inner-content">
               <span class="not_found_page__error-code" v-text="'404'" />
               <h1 class="not_found_page__title" v-text="$t('router.not_found')" />
               <div
                  class="not_found_page__description"
                  v-text="$t('router.requested_resource_is_not_available')"
               />
               <img src="/images/error/asset-error.svg" alt="Access denied" width="80%" />
               <CustomLink :to="{ name: 'account-profile' }" v-slot="{ navigate }">
                  <Button
                     :label="$t('router.action.go_to_profile')"
                     severity="danger"
                     @click="navigate"
                  />
               </CustomLink>
            </div>
         </div>
      </div>
   </div>
</template>

<style lang="scss">
.not_found_page {
   &__container {
      @apply flex-1 flex justify-center;
   }

   &__content {
      @apply flex flex-col items-center justify-center;
   }

   &__gradient-bg {
      @apply p-1 m-auto rounded-[calc(var(--content-border-radius)*6)] bg-gradient-to-b from-[rgba(233,30,99,0.4)] via-transparent to-transparent;
   }

   &__inner-content {
      @apply rounded-[inherit] bg-surface-0 dark:bg-surface-900 p-14 flex flex-col gap-4 items-center;
   }

   &__error-code {
      @apply text-red-500 font-bold text-3xl;
   }

   &__title {
      @apply text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2;
   }

   &__description {
      @apply text-surface-600 dark:text-surface-200 mb-8;
   }
}
</style>
