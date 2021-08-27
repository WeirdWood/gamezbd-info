<template>
  <q-table
    title="Final chances"
    :rows="rows"
    :columns="columns"
    row-key="name"
    :pagination="initialPagination"
    separator="vertical"
    hide-bottom
    flat
    bordered
  />
</template>

<script>
import { defineComponent, computed } from "vue";

const columns = [
  {
    name: "name",
    label: "GRADE",
    align: "left",
    field: "name",
  },
  {
    name: "baseRate",
    label: "BASE CHANCE",
    field: "rate",
    format: val => `${val}%`,
  },
  {
    name: "finalRate",
    label: "SUCCESS RATE",
    field: "finalRate",
    format: val => `${val}%`,
  },
];

export default defineComponent({
  name: "Enhance Table",

  props: {
    baseRates: Array,
    bonus: Number,
  },

  setup(props) {
    function round(number) {
      return Math.round((number + Number.EPSILON) * 100) / 100;
    }

    const rows = computed(() => {
      return props.baseRates.map((baseRate) => ({
        ...baseRate,
        finalRate: round(baseRate.rate + props.bonus),
      }));
    });
    
    return {
      rows,
      columns,
      initialPagination: {
        rowsPerPage: 0,
      },
    };
  },
});
</script>
