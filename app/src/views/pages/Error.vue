<template>
   <div class="flex-1 flex justify-center">
      <div
         class="p-1 m-auto rounded-[calc(var(--content-border-radius)*6)] bg-gradient-to-b from-[rgba(233,30,99,0.4)] via-transparent to-transparent"
      >
         <div
            class="rounded-[inherit] bg-surface-0 dark:bg-surface-900 p-14 md:p-20 flex flex-col items-center"
         >
            <div class="gap-4 flex flex-col items-center">
               <div
                  class="flex justify-center items-center border-2 border-pink-500 rounded-full"
                  style="height: 3.2rem; width: 3.2rem"
               >
                  <i class="pi pi-fw pi-exclamation-circle !text-2xl text-pink-500"></i>
               </div>
               <h1
                  class="text-surface-900 dark:text-surface-0 font-bold text-5xl mb-2"
                  v-text="$t('error_occured')"
               />
               <span
                  class="text-muted-color mb-8"
                  v-text="$t('requested_resource_is_not_available')"
               />
               <img src="/images/error/asset-error.svg" alt="Error" class="mb-8" width="80%" />
               <div class="col-span-12 mt-8 text-center">
                  <div class="flex flex-col gap-4">
                     <CustomLink
                        v-if="$router.options.history.state.back"
                        :to="$router.options.history.state.back"
                     >
                        <template #default="{ navigate }">
                           <Button
                              @click="navigate"
                              :label="$t('go_back')"
                              variant="outlined"
                              severity="danger"
                           />
                        </template>
                     </CustomLink>
                     <CustomLink :to="{ name: 'dashboard' }">
                        <template #default="{ navigate }">
                           <Button :label="$t('go_to_dashboard')" @click="() => navigate()" />
                        </template>
                     </CustomLink>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>
