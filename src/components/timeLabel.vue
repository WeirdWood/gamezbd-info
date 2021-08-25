<template>
  <p class="row items-center q-my-xs">
    {{ name }} in:
    <q-skeleton v-if="loading" type="text" square width="3rem" class="q-mx-xs" />
    <span v-else class="text-weight-medium q-mx-xs">
      {{ clockTime(secs) }}
      <q-tooltip class="text-body2" :offset="[8, 8]">
        {{ `At ${reachDate} (${clockTime(secs)} left)` }}
      </q-tooltip>
    </span>
    <q-btn
      :disable="loading"
      round
      @click="addToAlarm()"
      color="secondary"
      flat
      dense
      icon="add_alert"
    >
      <q-tooltip class="text-body2" :offset="[8, 8]"> Add to alarm </q-tooltip>
    </q-btn>
  </p>
</template>

<script>
import { computed } from "vue";
import useStates from "../modules/states";

export default {
  name: "timeLabel",

  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    name: String,
    secs: Number,
  },

  setup(props) {
    const { clockTime } = useStates();

    function isToday(date) {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }

    function addToAlarm() {}

    const reachDate = computed(() => {
      let ret = new Date(Date.now() + props.secs * 1000);
      if (isToday(ret)) return ret.toLocaleTimeString("en-US");
      else return ret.toLocaleString("en-US");
    });

    return { clockTime, reachDate, addToAlarm };
  },
};
</script>
