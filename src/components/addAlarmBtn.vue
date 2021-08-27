<template>
  <q-btn :disable="disable" round color="secondary" flat dense icon="add_alert">
    <q-tooltip class="text-body2" :offset="[8, 8]"> Add to alarm </q-tooltip>

    <q-popup-proxy v-model="showPopup">
      <q-banner>
        <form @submit.prevent.stop="submit()" autocomplete="off">
          <div class="row items-center">
            Notify me
            <q-input
              dense
              ref="offsetRef"
              class="q-px-sm q-pt-md"
              v-model.number="offsetTime"
              type="number"
              min="0"
              style="width: 5rem"
              :rules="[
                (val) => (val !== null && val !== '') || 'Required',
                (val) =>
                  (val >= 0 && val <= 60) ||
                  'Number needs to be within 0 to 60',
              ]"
            />
            minutes early
          </div>
          <div class="row q-mt-sm justify-end">
            <q-btn
              flat
              dense
              color="primary"
              label="Add"
              type="submit"
              padding="0.25rem 0.75rem"
            />
          </div>
        </form>
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
    date: Number,
  },

  setup(props) {
    const offsetTime = ref(0);
    const offsetRef = ref(null);
    const showPopup = ref(false);
    const { addToAlarm } = useStates();

    function submit() {
      if (!offsetRef.value.hasError) {
        addToAlarm(props.date, props.name, offsetTime.value, props.icon);
        showPopup.value = false;
      }
    }

    return {
      offsetTime,
      offsetRef,
      showPopup,
      submit,
    };
  },
};
</script>
