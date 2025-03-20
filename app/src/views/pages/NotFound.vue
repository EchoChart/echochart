<template>
   <div class="flex-1 flex justify-center">
      <div class="flex flex-col items-center justify-center">
         <div
            class="p-1 m-auto rounded-[calc(var(--content-border-radius)*6)] bg-gradient-to-b from-[rgba(233,30,99,0.4)] via-transparent to-transparent"
         >
            <div
               class="rounded-[inherit] bg-surface-0 dark:bg-surface-900 p-14 flex flex-col gap-4 items-center"
            >
               <span class="text-red-500 font-bold text-3xl" v-text="'404'" />
               <h1
                  class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2"
                  v-text="$t('not_found')"
               />
               <div
                  class="text-surface-600 dark:text-surface-200 mb-8"
                  v-text="$t('requested_resource_is_not_available')"
               />
               <img src="/images/error/asset-error.svg" alt="Access denied" width="80%" />
               <CustomLink :to="{ name: 'dashboard' }" v-slot="navigate">
                  <Button
                     :label="$t('go_to_dashboard')"
                     severity="danger"
                     @click="() => navigate()"
                  />
               </CustomLink>
            </div>
         </div>
      </div>
   </div>
</template>
