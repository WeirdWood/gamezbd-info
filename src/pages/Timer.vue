<template>
  <div class="container">
    <q-page class="q-mx-md q-py-lg">
      <div class="row q-gutter-y-md">
        <q-card flat class="col-md col-sm-12 col-xs-12 q-mr-md q-px-md q-py-lg">
          <h5 class="q-ma-none q-pb-md text-weight-regular text-primary">
            Server Timer
          </h5>
          <q-card-section class="q-pa-none text-body2">
            <p class="q-my-sm">
              In-game time:
              <span class="text-weight-medium">
                {{ displayHour }}:{{ displayMinute }} {{ ampm }}
              </span>
            </p>
            <time-label
              :name="clock.isDay ? 'Night time' : 'Day time'"
              :secs="
                clock.isDay
                  ? clock.secsUntilNightStart
                  : clock.secsUntilNightEnd
              "
            />
            <time-label
              :name="`Daily reset`"
              :secs="clock.secsUntilDailyReset"
            />
            <time-label
              :name="`Barter points reset`"
              :secs="clock.secsUntilBarterPointReset"
            />
            <time-label
              :name="`Imperial crafting reset`"
              :secs="clock.secsUntilImperialReset"
              :icon="'/img/game-icons/imperial-crafting-icon.png'"
              :loading="isLoading || serverStat.new_state !== 'AV'"
              :disableAlarmBtn="serverStat.new_state !== 'AV'"
            />
            <time-label
              :name="`Imperial trading reset`"
              :secs="clock.secsUntilImperialTradingReset"
              :icon="'/img/game-icons/imperial-trading-icon.png'"
              :loading="isLoading || serverStat.new_state !== 'AV'"
              :disableAlarmBtn="serverStat.new_state !== 'AV'"
            />
            <time-label
              :name="`Black Spirit's Adventure reset`"
              :secs="clock.secsUntilJumanjiReset"
              :icon="'/img/game-icons/dice-game-icon.png'"
            />
            <br />
            <div class="row items-center">
              {{ selectedServer.label }} :
              <span v-if="error" class="text-negative q-mx-xs">
                Could not load server's data, please try again later.
              </span>
              <q-skeleton
                v-else-if="isLoading"
                type="text"
                square
                width="2rem"
                class="q-mx-xs"
              />
              <span
                v-else
                :class="
                  serverStat.new_state === 'AV'
                    ? 'text-positive'
                    : 'text-negative'
                "
                class="q-mx-xs"
              >
                {{ serverStat.new_state === "AV" ? "Online" : "Offline" }}
                <q-tooltip class="text-body2" :offset="[8, 8]">
                  {{
                    (serverStat.new_state === "AV" ? "Online" : "Offline") +
                    " duration: " +
                    onlineDuration
                  }}
                </q-tooltip>
              </span>
            </div>
          </q-card-section>
        </q-card>
        <q-card flat class="col-md col-sm-12 col-xs-12 q-px-md q-py-lg">
          <h5 class="q-ma-none q-pb-md text-weight-regular text-primary">
            GameZ Weekend Event
          </h5>
          <q-card-section class="q-pa-none text-body2">
            <p style="line-height: 2">
              <label class="text-weight-medium"> This Weekend </label> <br />
              <span v-html="weekendEvents[thisWeekIndex].detail"></span> <br />
              Estimate:
              <span v-if="weekendEvents[thisWeekIndex].isActive">
                duration
                <span class="text-weight-medium">
                  {{ clockTime(weekendEvents[thisWeekIndex].duration) }}
                </span>
                , ends in
                <span class="text-weight-medium">
                  {{ clockTime(weekendEvents[thisWeekIndex].time) }}
                </span>
              </span>
              <span v-else>
                starts in
                <span class="text-weight-medium">
                  {{ clockTime(weekendEvents[thisWeekIndex].time) }}
                </span>
              </span>
              <br />
              <br />
              <label class="text-weight-medium"> Next Weekend </label>
              <br />
              <span v-html="weekendEvents[nextWeekIndex].detail"></span> <br />
              Estimate: starts in
              <span class="text-weight-medium">
                {{ clockTime(weekendEvents[nextWeekIndex].time) }}
              </span>
              <br />
              <br />
              <span>
                These results are estimate, please check
                <a
                  class="text-secondary"
                  style="text-decoration: none"
                  href="https://t.me/gamezbd"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  this link
                </a>
                for accurate information and timing on weekend events.
              </span>
            </p>
          </q-card-section>
        </q-card>
      </div>
    </q-page>
  </div>
</template>

<script>
import { onMounted, reactive, computed, ref } from "vue";
import timeLabel from "../components/timeLabel.vue";
import useStates from "../modules/states";
import weekendEventData from "../database/weekendEvent.json";

// const NAUrl =
//   "https://status.gamezbd.net/api/getMonitor/7DMKmfmWE6?m=784986409";
// const EUUrl =
//   "https://status.gamezbd.net/api/getMonitor/7DMKmfmWE6?m=784986444";
// const corsServer = "https://cors.bridged.cc/";
const NAUrl =
  "https://api.freshping.io/v1/public-check-state-changes/?check_id=673355";
const EUUrl =
  "https://api.freshping.io/v1/public-check-state-changes/?check_id=673360";

export default {
  name: "Timer",

  components: {
    timeLabel,
  },

  setup() {
    const clock = reactive({
      isDay: false,
      inGameHour: 0,
      inGameMinute: 0,
      secsUntilNightStart: 0,
      secsUntilNightEnd: 0,
      secsUntilDailyReset: 0,
      secsUntilImperialReset: 0,
      secsUntilImperialTradingReset: 0,
      secsUntilJumanjiReset: 0,
      secsUntilBarterPointReset: 0,
    });
    const serverStat = ref({});
    const weekendEvents = reactive(weekendEventData);
    const thisWeekIndex = ref(0);
    const nextWeekIndex = ref(1);
    const { selectedServer, clockTime, getNextOccuranceOfUTCDayAndHour } =
      useStates();
    const isLoading = ref(true);
    const error = ref(false);
    const fetchInterval = ref(true);

    (async () => {
      let url = selectedServer.value.value === "NA" ? NAUrl : EUUrl;
      await getServerData(url);
      runFetchInterval(url);
    })();

    onMounted(() => {
      let baseTick = 4444.444444;
      setInterval(updateClockActive, baseTick);
      setInterval(updateClock, baseTick * 6);
      setInterval(updateCountdowns, 5 * 1000);
      setInterval(updateWeekendEvent, 20 * 1000);
      updateClock();
      updateCountdowns();
      updateWeekendEvent();
    });

    // async function getServerData(url) {
    //   try {
    //     var addrArr = [url];
    //     const response = await fetch(`${process.env.WORKER_URL}/cors`, {
    //       method: "POST",
    //       body: JSON.stringify(addrArr),
    //     });
    //     var data = await response.text();
    //     let sliceStr = `<a class='multicorsproxy' href='${url}'>true</a>`;
    //     data = data.replace(sliceStr, "");
    //     data = JSON.parse(data);
    //     serverStat.value = data.monitor.logs[0];
    //     isLoading.value = false;
    //     updateCountdowns();
    //   } catch (err) {
    //     //Backup
    //     try {
    //       const data = await fetch(corsServer + url).then((response) =>
    //         response.json()
    //       );
    //       serverStat.value = data.monitor.logs[0];
    //       isLoading.value = false;
    //       updateCountdowns();
    //     } catch (err) {
    //       error.value = true;
    //     }
    //   }
    // }

    async function runFetchInterval(url) {
      while (fetchInterval.value && !error.value) {
        await new Promise((resolve) => setTimeout(resolve, 15 * 60 * 1000));
        await getServerData(url);
      }
    }

    async function getServerData(url) {
      try {
        const response = await fetch(url);
        let data = await response.text();
        data = JSON.parse(data);
        serverStat.value = data.results[0];
        serverStat.value.time = new Date(serverStat.value.check_start_time);
        isLoading.value = false;
        updateCountdowns();
      } catch (err) {
        error.value = true;
      }
    }

    function updateCountdowns() {
      let d = new Date();
      let startHour = Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate()
      );
      let rlDayElapsedS = (Date.now() - startHour) / 1000;
      let elapsed = (Date.now() - serverStat.value.time) / 1000;

      // Midnight UTC
      clock.secsUntilDailyReset = 24 * 60 * 60 - rlDayElapsedS;

      // Imperial cooking/alchemy reset is every 3 hours from reset
      clock.secsUntilImperialReset = 3 * 60 * 60 - (elapsed % (60 * 60 * 3));

      // Imperial trading reset is every 4 hours from reset
      clock.secsUntilImperialTradingReset =
        4 * 60 * 60 - (elapsed % (60 * 60 * 4));

      // Jumani board game reset is at 5am UTC
      clock.secsUntilJumanjiReset =
        60 * 60 * 24 - ((rlDayElapsedS - 5 * 60 * 60) % (60 * 60 * 24));
      if (clock.secsUntilJumanjiReset > 60 * 60 * 24) {
        clock.secsUntilJumanjiReset -= 60 * 60 * 24;
      }

      // Barter reset is at 6am UTC
      clock.secsUntilBarterPointReset =
        60 * 60 * 24 - ((rlDayElapsedS - 6 * 60 * 60) % (60 * 60 * 24));
      if (clock.secsUntilBarterPointReset > 60 * 60 * 24) {
        clock.secsUntilBarterPointReset -= 60 * 60 * 24;
      }
    }

    // This version gets called far more often but doesn't update if
    // the site is not the active tab (using HTML page visibility api)
    function updateClockActive() {
      if (document.hidden) {
        return;
      }
      updateClock();
    }

    function updateClock() {
      let d = new Date();
      let startHour = Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate()
      );
      let rlDayElapsedS = (Date.now() - startHour) / 1000;
      let secsIntoGameDay = (rlDayElapsedS + 200 * 60 + 20 * 60) % (240 * 60);
      let gameHour;

      // Last part of the shifted day is night
      if (secsIntoGameDay >= 12000) {
        let secsIntoGameNight = secsIntoGameDay - 12000;
        let pctOfNightDone = secsIntoGameNight / (40 * 60);
        gameHour = 9 * pctOfNightDone;
        gameHour = gameHour < 2 ? 22 + gameHour : gameHour - 2;
        let secsUntilNightEnd = 40 * 60 - secsIntoGameNight;

        clock.isDay = false;
        clock.inGameHour = (gameHour / 1) >> 0;
        clock.inGameMinute = ((gameHour % 1) * 60) >> 0;
        clock.secsUntilNightEnd = secsUntilNightEnd;
        clock.secsUntilNightStart = secsUntilNightEnd + 12000;
      } else {
        let secsIntoGameDaytime = secsIntoGameDay;
        let pctOfDayDone = secsIntoGameDay / (200 * 60);
        gameHour = 7 + (22 - 7) * pctOfDayDone;
        let secsUntilNightStart = 12000 - secsIntoGameDaytime;

        clock.isDay = true;
        clock.inGameHour = (gameHour / 1) >> 0;
        clock.inGameMinute = ((gameHour % 1) * 60) >> 0;
        clock.secsUntilNightEnd = secsUntilNightStart + 40 * 60;
        clock.secsUntilNightStart = secsUntilNightStart;
      }
    }

    function updateWeekendEvent() {
      let baselineDay = new Date(Date.UTC(2022, 2, 7, 12)); //baseline is the last drop rate event end time (assumed 12 o'clock monday UTC)
      let currentDate = new Date();

      let diffInWeeks = GetDifferenceInWeeks(baselineDay, currentDate);

      thisWeekIndex.value = diffInWeeks % weekendEvents.length;
      nextWeekIndex.value = (diffInWeeks + 1) % weekendEvents.length;

      let secsTillNextEventStart =
        (getNextOccuranceOfUTCDayAndHour(currentDate, 5, 22) - Date.now()) /
        1000;
      let secsTillNextEventEnd =
        (getNextOccuranceOfUTCDayAndHour(currentDate, 1, 12) - Date.now()) /
        1000;

      if (secsTillNextEventStart < secsTillNextEventEnd) {
        weekendEvents[thisWeekIndex.value].isActive = false;
        weekendEvents[thisWeekIndex.value].time = secsTillNextEventStart;
        weekendEvents[nextWeekIndex.value].time =
          secsTillNextEventStart + 60 * 60 * 24 * 7;
      } else if (secsTillNextEventStart > secsTillNextEventEnd) {
        weekendEvents[thisWeekIndex.value].isActive = true;
        weekendEvents[thisWeekIndex.value].time = secsTillNextEventEnd;
        weekendEvents[thisWeekIndex.value].duration =
          (Date.now() -
            (getNextOccuranceOfUTCDayAndHour(currentDate, 5, 22) -
              1000 * 60 * 60 * 24 * 7)) /
          1000;
        weekendEvents[nextWeekIndex.value].time = secsTillNextEventStart;
      }
    }

    function GetDifferenceInWeeks(baselineDay, currentDate) {
      let diffInMs = currentDate - baselineDay;

      let msPerDay = 1000 * 60 * 60 * 24;
      let diffInDays = Math.floor(diffInMs / msPerDay);

      let diffInWeeks = Math.floor(diffInDays / 7);
      return diffInWeeks;
    }

    const ampm = computed(() => (clock.inGameHour < 12 ? "AM" : "PM"));
    const displayHour = computed(() => {
      let t = clock.inGameHour % 12;
      if (t === 0) {
        t = 12;
      }
      return clock.inGameHour > 0 && clock.inGameHour < 10 ? "0" + +t : t;
    });
    const displayMinute = computed(() =>
      clock.inGameMinute < 10 ? "0" + +clock.inGameMinute : clock.inGameMinute
    );

    const onlineDuration = computed(() => {
      return clockTime(
        (Date.now() - new Date(serverStat.value.check_start_time)) / 1000
      );
    });

    return {
      clock,
      selectedServer,
      serverStat,
      weekendEvents,
      thisWeekIndex,
      nextWeekIndex,
      isLoading,
      error,
      ampm,
      displayHour,
      displayMinute,
      onlineDuration,
      clockTime,
    };
  },
};
</script>
