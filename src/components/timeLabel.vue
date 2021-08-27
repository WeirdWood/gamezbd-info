<template>
  <p class="row items-center q-my-xs">
    <q-icon v-if="icon" :name="`img:${icon}`" size="1.5rem" class="q-mr-sm" />
    {{ name }} in:
    <q-skeleton
      v-if="loading"
      type="text"
      square
      width="3rem"
      class="q-mx-xs"
    />
    <span v-else class="text-weight-medium q-mx-xs">
      {{ clockTime(secs) }}
      <q-tooltip class="text-body2" :offset="[8, 8]">
        {{ `At ${reachDate} (${clockTime(secs)} left)` }}
      </q-tooltip>
    </span>
    <add-alarm-btn
      :disable="loading || disableAlarmBtn"
      :name="name"
      :date="reachMs"
      :icon="icon"
    />
  </p>
</template>

<script>
import { computed } from "vue";
import useStates from "../modules/states";
import addAlarmBtn from "../components/addAlarmBtn.vue";

export default {
  name: "timeLabel",

  components: {
    addAlarmBtn,
  },

  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    disableAlarmBtn: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: undefined,
    },
    name: String,
    secs: Number,
  },

  setup(props) {
    const { clockTime, addToAlarm } = useStates();

    function isToday(date) {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }

    const reachDate = computed(() => {
      let ret = new Date(Date.now() + props.secs * 1000);
      if (isToday(ret)) return ret.toLocaleTimeString("en-US");
      else return ret.toLocaleString("en-US");
    });

    const reachMs = computed(() => {
      return Date.now() + props.secs * 1000;
    });

    return { clockTime, reachDate, reachMs, addToAlarm };
  },
};
</script>
