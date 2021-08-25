<template>
  <q-btn :disable="disable" round color="secondary" flat dense icon="add_alert">
    <q-tooltip class="text-body2" :offset="[8, 8]"> Add to alarm </q-tooltip>

    <q-popup-proxy>
      <q-banner>
        <div class="row items-center">
          Notify me
          <q-input
            dense
            class="q-px-sm"
            v-model.number="offsetTime"
            type="number"
            style="width: 3rem"
          />
          minutes early
        </div>
        <div class="row q-mt-sm justify-end">
          <q-btn
            flat
            dense
            color="primary"
            label="Add"
            v-close-popup
            padding="0.25rem 0.75rem"
            @click="addToAlarm(secs, name, offsetTime, icon)"
          />
        </div>
      </q-banner>
    </q-popup-proxy>
  </q-btn>
</template>

<script>
import { ref } from "vue";
import useStates from "../modules/states";

export default {
  name: "Add Alarm Btn",

  props: {
    disable: {
      type: Boolean,
      default: false,
    },
    icon: String,
    name: String,
    secs: Number,
  },

  setup() {
    const offsetTime = ref(0);
    const { addToAlarm } = useStates();

    return {
      offsetTime,
      addToAlarm,
    };
  },
};
</script>
