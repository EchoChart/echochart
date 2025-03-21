<script setup>
import Collection from '@/lib/Collection';

const props = defineProps({
   select: {
      type: String,
      default: '*, address(*)'
   }
});

const { data } = await supabase.from('client').select(props.select).throwOnError();
const clients = new Collection(data);
</script>

<template>
   <Select
      :filter="true"
      :options="clients._data"
      option-label="display_name"
      option-value="id"
      @value-change="
         $emit(
            'client',
            clients._data.find((c) => _get(c, $attrs.optionValue || 'id') == $event)
         )
      "
   />
</template>
