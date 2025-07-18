<template>
   <div class="error-page">
      <div class="error-page__container">
         <div class="error-page__content">
            <div class="error-page__message">
               <div class="error-page__icon">
                  <i class="pi pi-fw pi-exclamation-circle"></i>
               </div>
               <h1 class="error-page__title" v-text="$t('router.error_occured')"></h1>
               <span
                  class="error-page__description"
                  v-text="$t('router.requested_resource_is_not_available')"
               ></span>
               <img src="/images/error/asset-error.svg" alt="Error" class="error-page__image" />
               <div class="error-page__links">
                  <CustomLink
                     v-if="$router.options.history.state.back"
                     :to="'' + $router.options.history.state.back"
                     v-slot="{ navigate }"
                  >
                     <Button
                        @click="navigate"
                        :label="$t('router.action.go_back')"
                        variant="outlined"
                        severity="danger"
                     />
                  </CustomLink>
                  <CustomLink :to="{ name: 'account-profile' }" v-slot="{ navigate }">
                     <Button :label="$t('router.action.go_to_profile')" @click="navigate" />
                  </CustomLink>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<style lang="scss">
.error-page {
   @apply flex-1 flex justify-center;

   &__container {
      @apply p-1 m-auto rounded-[calc(var(--content-border-radius)*6)] bg-gradient-to-b from-[rgba(233,30,99,0.4)] via-transparent to-transparent;
   }

   &__content {
      @apply rounded-[inherit] bg-surface-0 dark:bg-surface-900 p-14 md:p-20 flex flex-col items-center;
   }

   &__message {
      @apply gap-4 flex flex-col items-center;
   }

   &__icon {
      @apply flex justify-center items-center border-2 border-pink-500 rounded-full;
      height: 3.2rem;
      width: 3.2rem;
   }

   &__title {
      @apply text-surface-900 dark:text-surface-0 font-bold text-5xl mb-2;
   }

   &__description {
      @apply text-muted-color mb-8;
   }

   &__image {
      @apply mb-8;
      width: 80%;
   }

   &__links {
      @apply flex gap-4 mt-8 text-center;
   }
}
</style>
