<template>
  <q-table
    title="Final chances"
    :rows="rows"
    :columns="columns"
    row-key="name"
    separator="vertical"
  />
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
   name: "Enhance Table",

   props: {
       rows: Array,
       collumns: Array
   }
});
</script>