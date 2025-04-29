<script setup>
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
</script>

<template>
   <div class="card flex flex-wrap items-start gap-4 p-4">
      <span class="flex-0 mx-auto relative">
         <AvatarPlaceholder
            :alt="user?.user_metadata?.display_name"
            preview
            class="min-w-24 rounded-[var(--content-border-radius)] overflow-hidden"
            :src="user?.avatar_url"
            :placeholder="user.display_name || user.user_metadata?.display_name"
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
         <FormField fluid :label="$t('display_name')" v-slot="slotProps">
            <InputText
               v-bind="slotProps"
               readonly
               :model-value="user?.user_metadata?.display_name"
            />
         </FormField>
         <FormField fluid :label="$t('email')" v-slot="slotProps">
            <InputText v-bind="slotProps" readonly :model-value="user?.email" />
         </FormField>
         <FormField fluid :label="$t('phone')" v-slot="slotProps">
            <PhoneInput v-bind="slotProps" :model-value="user?.phone" readonly />
         </FormField>
      </FormBox>
      <FormBox legend="Logs" class="flex-1">
         <FormField fluid :label="$t('created_at')" v-slot="slotProps">
            <InputText v-bind="slotProps" readonly :model-value="user?.created_at" />
         </FormField>
         <FormField fluid :label="$t('email_confirmed_at')" v-slot="slotProps">
            <InputText v-bind="slotProps" readonly :model-value="user?.email_confirmed_at" />
         </FormField>
         <FormField fluid :label="$t('last_sign_in_at')" v-slot="slotProps">
            <InputText v-bind="slotProps" readonly :model-value="user?.last_sign_in_at" />
         </FormField>
      </FormBox>
   </div>
</template>
