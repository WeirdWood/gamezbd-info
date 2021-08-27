<template>
  <div class="container">
    <q-page class="q-mx-md q-py-lg">
      <q-card flat class="q-px-md q-py-lg">
        <h5 class="q-ma-none q-pb-md text-weight-regular text-primary">
          GameZ Boss Timer
        </h5>
        <q-card-section class="q-pa-none">
          <div class="row items-center">
            <div class="col-md col-sm-12 col-xs-12 q-mr-md">
              <q-checkbox
                v-model="formValues.hideHuntingBoss"
                label="Hide hunting boss"
              >
                <q-tooltip class="text-body2">
                  Hide hunting bosses from the timer.
                </q-tooltip>
              </q-checkbox>
            </div>
            <div class="col-md col-sm-12 col-xs-12 q-mr-md">
              <q-checkbox
                v-model="formValues.useSound"
                label="Sound notification"
              >
                <q-tooltip class="text-body2">
                  Sound notification is automatic and seperate from alarm.
                </q-tooltip>
              </q-checkbox>
            </div>
            <div class="row items-center col-md col-sm-12 col-xs-12 no-wrap">
              Notify me
              <q-input
                dense
                ref="offsetRef"
                class="q-px-sm q-pt-md"
                v-model.number="formValues.globalEarlyOffset"
                type="number"
                min="0"
                style="width: 100%; max-width: 8rem"
                :rules="[
                  (val) => (val !== null && val !== '') || 'Required',
                  (val) =>
                    (val >= 0 && val <= 60) ||
                    'Number needs to be within 0 to 60',
                ]"
              />
              minutes early
            </div>
          </div>
          <q-select
            filled
            v-model="formValues.selectedChannels"
            :options="channelOptions"
            label="Filter channels"
            multiple
            emit-value
            map-options
          >
            <template
              v-slot:option="{ itemProps, opt, selected, toggleOption }"
            >
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label v-html="opt"></q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    :model-value="selected"
                    @update:model-value="toggleOption(opt)"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-section class="q-pa-none q-mt-lg">
          <q-table
            :rows="bossArray"
            :columns="columns"
            row-key="name"
            :pagination="{ rowsPerPage: 0 }"
            flat
            bordered
            hide-pagination
            :loading="isLoading"
          >
            <template v-slot:body="props">
              <q-tr
                :props="props"
                :class="{
                  'text-strike text-weight-light': props.row.reached,
                  'text-negative': props.row.close && !props.row.reached,
                  'text-italic': props.row.notified,
                }"
              >
                <q-td
                  key="name"
                  :props="props"
                  class="row items-center no-wrap"
                >
                  <q-icon
                    :name="
                      props.row.icon
                        ? `img:${props.row.icon}`
                        : `img:/img/game-icons/unknown.png`
                    "
                    size="2rem"
                    class="q-mr-sm"
                  />
                  {{ props.row.name }}
                </q-td>

                <q-td key="channel" :props="props">
                  {{ props.row.channel }}
                </q-td>
                <q-td key="time" :props="props">
                  {{ props.row.displayCountdown }}
                </q-td>

                <q-td key="action" :props="props">
                  <add-alarm-btn
                    :disable="isLoading"
                    :name="`${props.row.name} ${stripChName(
                      props.row.channel
                    )}`"
                    :date="props.row.time"
                    :icon="props.row.icon"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>

          <div v-if="error" class="q-pa-md">
            <span class="text-negative">
              Could not load data, please try again later.
            </span>
          </div>
        </q-card-section>
      </q-card>
    </q-page>
  </div>
</template>

<script>
import { reactive, ref, onBeforeMount, onBeforeUnmount, watch } from "vue";
import { useQuasar } from "quasar";
import useStates from "../modules/states";
import sortBy from "lodash.sortby";
import addAlarmBtn from "../components/addAlarmBtn.vue";
import bossIcon from "../database/bossIcon.json";

const optionsNA = [
  "GamezBD NA Ch 1",
  "GamezBD NA Ch 2",
  "GamezBD NA Ch 3",
  "GamezBD NA Season Ch",
];
const optionsEU = [
  "GamezBD EU Ch 1",
  "GamezBD EU Ch 2",
  "GamezBD EU Ch 3",
  "GamezBD EU Season Ch",
];
const huntingBossNames = [
  "Balenos Blue Whale",
  "King Griffon",
  "Mediah Blue Whale",
  "Calpheon Blue Whale",
  "Fugitive Khalk",
];
const columns = [
  {
    name: "name",
    label: "Name",
    align: "left",
    field: "name",
  },
  {
    name: "channel",
    label: "Channel",
    align: "left",
    field: "channel",
  },
  {
    name: "time",
    label: "Time Left",
    field: "displayCountdown",
  },
  {
    name: "action",
    label: "Action",
    field: "",
    align: "center",
  },
];

export default {
  name: "Boss Timer",

  components: {
    addAlarmBtn,
  },

  setup() {
    const $q = useQuasar();
    const {
      storagePermission,
      selectedServer,
      alarmArray,
      clockTime,
      reverseClockTime,
      getNextOccuranceOfUTCDayAndHour,
    } = useStates();
    const channelOptions =
      selectedServer.value.value === "NA" ? optionsNA : optionsEU;
    const formValues = reactive({
      selectedChannels: channelOptions,
      hideHuntingBoss: true,
      useSound: false,
      globalEarlyOffset: 0,
      server: selectedServer.value.value,
    });
    const bossArray = ref([]);
    const isLoading = ref(true);
    const error = ref(false);
    const interval = ref(null);
    const fetchInterval = ref(true);

    var bossData;
    var alarmBossAudio = new Audio("/alarm-effect.mp3");

    onBeforeMount(async () => {
      await getBossData();
      runFetchInterval();
      if (!error.value && !isLoading.value) {
        evalTimer();
        runTimer();
      }

      if (!storagePermission.value) {
        localStorage.removeItem("bossConfig");
      } else if (localStorage.getItem("bossConfig")) {
        try {
          let bossConfig = JSON.parse(localStorage.getItem("bossConfig"));
          if (bossConfig.server === selectedServer.value.value)
            formValues.selectedChannels = bossConfig.selectedChannels
              ? bossConfig.selectedChannels
              : formValues.selectedChannels;
          formValues.hideHuntingBoss =
            bossConfig.hideHuntingBoss === false
              ? bossConfig.hideHuntingBoss
              : formValues.hideHuntingBoss;
          formValues.globalEarlyOffset = bossConfig.globalEarlyOffset
            ? bossConfig.globalEarlyOffset
            : formValues.globalEarlyOffset;
          formValues.useSound = bossConfig.useSound
            ? bossConfig.useSound
            : formValues.useSound;
        } catch (e) {
          localStorage.removeItem("bossConfig");
        }
      }
    });

    onBeforeUnmount(() => {
      clearInterval(interval.value);
      fetchInterval.value = false;

      if (storagePermission.value) {
        localStorage.setItem("bossConfig", JSON.stringify(formValues));
      }
    });

    watch(
      () => [formValues.selectedChannels, formValues.hideHuntingBoss],
      () => {
        mapBossData(bossData);
        evalTimer();
      }
    );

    async function getBossData() {
      try {
        const response = await fetch(
          `${process.env.WORKER_URL}/bosses/${selectedServer.value.value}`
        );
        var data = await response.text();
        data = JSON.parse(data);
        bossData = data.data;
        mapBossData(bossData);
        isLoading.value = false;
      } catch (err) {
        error.value = true;
      }
    }

    function mapBossData(data) {
      if (data) {
        bossArray.value.length = 0;

        data.forEach((element) => {
          if (formValues.hideHuntingBoss) {
            if (huntingBossNames.includes(element.name)) return;
          }
          if (!formValues.selectedChannels.includes(element.server)) return;
          if (element.name === "Vell") return;

          let icon = bossIcon[element.name]
            ? `/img/game-icons/${bossIcon[element.name]}`
            : "/img/game-icons/unknown.png";
          let time = Date.parse(element.time);
          let notified = time < Date.now() ? true : false;
          bossArray.value.push({
            name: element.name,
            icon: icon,
            channel: element.server,
            time: time,
            notified: notified,
          });
        });
      }

      //Adding custom Vell time that account for the extra 30mins spawn time
      var d = new Date();
      let spawnHour = selectedServer.value.value === "NA" ? 23 : 16;
      let nextThursdayVellTime = Date.parse(
        getNextOccuranceOfUTCDayAndHour(d, 4, spawnHour, 30)
      );
      let nextSundayVellTime = Date.parse(
        getNextOccuranceOfUTCDayAndHour(d, 7, spawnHour, 30)
      );
      let nextVellTime =
        nextThursdayVellTime < nextSundayVellTime
          ? nextThursdayVellTime
          : nextSundayVellTime;

      for (const channel of channelOptions) {
        bossArray.value.push({
          name: "Vell",
          icon: `/img/game-icons/${bossIcon["Vell"]}`,
          channel: channel,
          time: nextVellTime,
        });
      }

      bossArray.value = sortBy(bossArray.value, "time");
    }

    async function evalTimer() {
      let d = Date.now();
      for (const element of bossArray.value) {
        let secs = (element.time - d) / 1000;
        if (secs <= 60 * 5) element.close = true;
        if (secs <= -(60 * 15)) element.remove = true;
        else if (secs <= 0) {
          element.displayCountdown = reverseClockTime(secs);
          element.reached = true;
        } else {
          if (element.name === "Vell")
            element.displayCountdown = clockTime(secs, true);
          else element.displayCountdown = clockTime(secs);
        }

        let alarmPoint =
          element.time - formValues.globalEarlyOffset * 60 * 1000;
        if (d < alarmPoint) {
          element.notified = false;
        } else if (!element.notified) {
          element.inAlarm = false;
          let alarmName = element.name + " " + stripChName(element.channel);
          for (const alarm of alarmArray.value) {
            if (alarmName == alarm.label && element.time == alarm.time) {
              element.inAlarm = true;
              break;
            }
          }
          if (!element.inAlarm) {
            //Ring the alarm
            element.notified = true;

            let chName = stripChName(element.channel);
            $q.notify({
              message:
                formValues.globalEarlyOffset === 0
                  ? `${element.name} ${chName} spawning!`
                  : `${element.name} ${chName} spawning in ${element.displayCountdown}!`,
              color: "positive",
              avatar: element.icon,
              timeout: 30000,
              progress: true,
            });

            if (formValues.useSound) await alarmBossAudio.play();
          }
        }
      }

      bossArray.value = bossArray.value.filter((item) => !item.remove);
    }

    function runTimer() {
      interval.value = setInterval(evalTimer, 2000);
    }

    async function runFetchInterval() {
      while (fetchInterval.value && !error.value) {
        await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 60 * 1000));
        await getBossData();
        evalTimer();
      }
    }

    function stripChName(name) {
      let chName = name;
      chName = chName.replace("GamezBD NA ", "");
      chName = chName.replace("GamezBD EU ", "");
      return chName;
    }

    return {
      channelOptions,
      formValues,
      columns,
      bossArray,
      isLoading,
      error,
      stripChName,
    };
  },
};
</script>
