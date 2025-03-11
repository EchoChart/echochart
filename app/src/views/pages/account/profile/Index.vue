<script setup>
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
</script>

<template>
   <div class="card flex flex-wrap items-start gap-4 p-4">
      <span class="flex-0 mx-auto relative">
         <Image
            width="144"
            :src="user?.avatar_url"
            preview
            :alt="user?.user_metadata?.display_name"
            class="min-w-24 rounded-[var(--content-border-radius)] overflow-hidden"
         />
         <Badge
            v-if="user?.email_confirmed_at"
            :severity="user?.email_confirmed_at ? 'primary' : 'danger'"
            class="!p-0 !h-fit !min-w-fit !w-fit !rounded-full absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-auto"
         >
            <i
               :title="user?.email_confirmed_at ? 'Email verified' : 'Email not verified'"
               class="pi pi-fw !text-2xl"
               :class="user?.email_confirmed_at ? 'pi-verified' : 'pi-exclamation-circle'"
            />
         </Badge>
      </span>
      <FormBox legend="User info" class="flex-1">
         <FormField fluid :label="$t('display_name')">
            <template v-slot="slotProps">
               <InputText
                  v-bind="slotProps"
                  readonly
                  :model-value="user?.user_metadata?.display_name"
               />
            </template>
         </FormField>
         <FormField fluid :label="$t('email')">
            <template v-slot="slotProps">
               <InputText v-bind="slotProps" readonly :model-value="user?.email" />
            </template>
         </FormField>
         <FormField fluid :label="$t('phone')">
            <template v-slot="slotProps">
               <InputMask
                  readonly
                  v-bind="slotProps"
                  :model-value="user?.phone"
                  mask="9999999999999"
               />
            </template>
         </FormField>
      </FormBox>
      <FormBox legend="Logs" class="flex-1">
         <FormField fluid :label="$t('created_at')">
            <template v-slot="slotProps">
               <InputText v-bind="slotProps" readonly :model-value="user?.created_at" />
            </template>
         </FormField>
         <FormField fluid :label="$t('email_confirmed_at')">
            <template v-slot="slotProps">
               <InputText v-bind="slotProps" readonly :model-value="user?.email_confirmed_at" />
            </template>
         </FormField>
         <FormField fluid :label="$t('last_sign_in_at')">
            <template v-slot="slotProps">
               <InputText v-bind="slotProps" readonly :model-value="user?.last_sign_in_at" />
            </template>
         </FormField>
      </FormBox>
   </div>
</template>
