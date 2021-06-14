<template>
  <div class="container mx-auto px-4 flex flex-col md:flex-row max-w-5xl">
    <div class="mr-0 mb-8 md:mr-8 md:mb-0 px-4 py-6 bg-white rounded shadow-lg break-words flex-1">
      <h6 class="text-xl font-normal leading-normal mt-0 mb-6 text-gray-800">
        Server Time
      </h6>
      <p class="leading-loose text-gray-800 font-light">
        <label class="text-sm font-bold text-gray-600">In-Game</label> <br />
        In-game time: <span class="font-normal">{{ displayHour }}:{{ displayMinute }} {{ ampm }}</span> <br />
        {{ clock.isDay ? "Night time in:" : "Day time in:" }}
        <span class="font-normal">{{ clock.isDay ? clockTime(clock.secsUntilNightStart) : clockTime(clock.secsUntilNightEnd) }}</span> <br />
        Daily reset in: <span class="font-normal"> {{ clockTime(clock.secsUntilDailyReset) }} </span><br />
        <span class="flex items-center" title="Imperial cooking/alchemy delivery">
          Imperial reset in: &nbsp;
          <svg v-if="isLoading" class="animate-spin h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span v-if="!isLoading && !error" class="font-normal">
            {{ clockTime(clock.secsUntilImperialResetNA) }} (NA), {{ clockTime(clock.secsUntilImperialResetEU) }} (EU)
          </span>
        </span>
        <span class="flex items-center" title="Imperial trading/fishing delivery">
          Imperial trading reset in: &nbsp;
          <svg v-if="isLoading" class="animate-spin h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span v-if="!isLoading && !error" class="font-normal">
            {{ clockTime(clock.secsUntilImperialTradingResetNA) }} (NA), {{ clockTime(clock.secsUntilImperialTradingResetEU) }} (EU)
          </span>
        </span>
        Black spirit dice game reset in: <span class="font-normal">{{ clockTime(clock.secsUntilJumanjiReset) }}</span> <br />
        Next Vell spawns in:
        <span class="font-normal">{{ clockTime(clock.secsUntilVellSpawnNA) }} (NA), {{ clockTime(clock.secsUntilVellSpawnEU) }} (EU)</span>
        <br />
        <br />
        <label class="text-sm font-bold text-gray-600">NA Server</label> <br />
        <span class="flex items-center">
          Status: &nbsp;
          <svg v-if="isLoading" class="animate-spin h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span v-if="!isLoading && !error" :class="serverStat.statusNA.label === 'up' ? 'text-green-500' : 'text-red-600'" class="mr-8 font-normal">
            {{ serverStat.statusNA.label }}
          </span>
          <span v-if="!isLoading && !error">
            {{ serverStat.statusNA.label === "up" ? "Online" : "Offline" }} duration:
            <span class="font-normal"> {{ serverStat.statusNA.duration }} </span>
          </span>
        </span>

        <label class="text-sm font-bold text-gray-600">EU Server</label> <br />
        <span class="flex items-center">
          Status: &nbsp;
          <svg v-if="isLoading" class="animate-spin h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span v-if="!isLoading && !error" :class="serverStat.statusEU.label === 'up' ? 'text-green-500' : 'text-red-600'" class="mr-8 font-normal">
            {{ serverStat.statusEU.label }}
          </span>
          <span v-if="!isLoading && !error">
            {{ serverStat.statusEU.label === "up" ? "Online" : "Offline" }} duration:
            <span class="font-normal"> {{ serverStat.statusEU.duration }} </span>
          </span>
        </span>

        <span v-if="error" class="text-sm text-red-500"> Unable to fetch server data, please try again later. </span>
      </p>
    </div>
    <div class="px-4 py-6 bg-white rounded shadow-lg break-words flex-1">
      <h6 class="text-xl font-normal leading-normal mt-0 mb-6 text-gray-800">
        Weekend Event
      </h6>
      <p class="leading-loose text-gray-800 font-light">
        <label class="text-sm font-bold text-gray-600">This Weekend</label> <br />
        <span v-html="weekendEvents[thisWeekIndex].detail"></span> <br />
        Estimate:
        <span v-if="weekendEvents[thisWeekIndex].isActive">
          duration <span class="font-normal"> {{ clockTime(weekendEvents[thisWeekIndex].duration) }} </span>, ends in
          <span class="font-normal"> {{ clockTime(weekendEvents[thisWeekIndex].time) }} </span>
        </span>
        <span v-else>
          starts in <span class="font-normal"> {{ clockTime(weekendEvents[thisWeekIndex].time) }} </span>
        </span>
        <br />
        <br />
        <label class="text-sm font-bold text-gray-600">Next Weekend</label> <br />
        <span v-html="weekendEvents[nextWeekIndex].detail"></span> <br />
        Estimate: starts in <span class="font-normal"> {{ clockTime(weekendEvents[nextWeekIndex].time) }} </span>
        <br />
        <br />
        <span class="text-sm"
          >These results are estimate, please check
          <a class="text-blue-500" href="https://t.me/gamezbd" target="_blank" rel="noopener noreferrer"> this link </a> for accurate information and
          timing on weekend events.</span
        >
      </p>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, computed, onBeforeMount, ref } from "vue";
import weekendEventData from "../database/weekendEvent.json";

const NAArsha = "https://status.gamezbd.net/api/getMonitor/7DMKmfmWE6?m=784986409";
const EUArsha = "https://status.gamezbd.net/api/getMonitor/7DMKmfmWE6?m=784986444";
const corsServer = "https://cors.bridged.cc/";

export default {
  setup() {
    const clock = reactive({
      isDay: false,
      inGameHour: 0,
      inGameMinute: 0,
      secsUntilNightStart: 0,
      secsUntilNightEnd: 0,
      secsUntilDailyReset: 0,
      secsUntilImperialResetEU: 0,
      secsUntilImperialResetNA: 0,
      secsUntilImperialTradingResetNA: 0,
      secsUntilImperialTradingResetEU: 0,
      secsUntilJumanjiReset: 0,
      secsUntilVellSpawnNA: 0,
      secsUntilVellSpawnEU: 0,
    });
    const serverStat = reactive({
      statusNA: Object,
      statusEU: Object,
    });
    const weekendEvents = reactive(weekendEventData);
    const thisWeekIndex = ref(0);
    const nextWeekIndex = ref(1);
    const isLoading = ref(true);
    const error = ref(false);

    onBeforeMount(async () => {
      try {
        const [dataNA, dataEU] = await Promise.all([
          fetch(corsServer + NAArsha).then((response) => response.json()),
          fetch(corsServer + EUArsha).then((response) => response.json()),
        ]);

        [serverStat.statusNA, serverStat.statusEU] = [dataNA.monitor.logs[0], dataEU.monitor.logs[0]];
        isLoading.value = false;
        updateCountdowns();
      } catch (err) {
        console.log(err);

        //Backup in case Bridged's service goes down
        try {
          var addrArr = [NAArsha, EUArsha];
          const response = await fetch(process.env.VUE_APP_CORS_SERVER, {
            method: "POST",
            body: JSON.stringify(addrArr),
          });
          var data = await response.text();
          let NASplitStr = `<a class='multicorsproxy' href='${NAArsha}'>true</a>`;
          let EUSplitStr = `<a class='multicorsproxy' href='${EUArsha}'>true</a>`;
          let [dataNA, dataEU] = splitResponse(data, [NASplitStr, EUSplitStr]);
          dataNA = JSON.parse(dataNA);
          dataEU = JSON.parse(dataEU);
          [serverStat.statusNA, serverStat.statusEU] = [dataNA.monitor.logs[0], dataEU.monitor.logs[0]];
          isLoading.value = false;
          updateCountdowns();
        } catch (err) {
          error.value = true;
          console.log(err);
        }
      }
    });

    onMounted(() => {
      var baseTick = 4444.444444;
      setInterval(updateClockActive, baseTick);
      setInterval(updateClock, baseTick * 6);
      setInterval(updateCountdowns, 5 * 1000);
      setInterval(updateWeekendEvent, 20 * 1000);
      updateClock();
      updateCountdowns();
      updateWeekendEvent();
    });

    function updateCountdowns() {
      var d = new Date();
      var startHour = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
      var rlDayElapsedS = (Date.now() - startHour) / 1000;
      let NAelapsed = (Date.now() - serverStat.statusNA.time * 1000) / 1000;
      let EUelapsed = (Date.now() - serverStat.statusEU.time * 1000) / 1000;

      // Midnight UTC
      clock.secsUntilDailyReset = 24 * 60 * 60 - rlDayElapsedS;

      // Imperial cooking/alchemy reset is every 3 hours from reset
      clock.secsUntilImperialResetNA = 3 * 60 * 60 - (NAelapsed % (60 * 60 * 3));
      clock.secsUntilImperialResetEU = 3 * 60 * 60 - (EUelapsed % (60 * 60 * 3));

      // Imperial trading reset is every 4 hours from reset
      clock.secsUntilImperialTradingResetNA = 4 * 60 * 60 - (NAelapsed % (60 * 60 * 4));
      clock.secsUntilImperialTradingResetEU = 4 * 60 * 60 - (EUelapsed % (60 * 60 * 4));

      // Jumani board game reset is at 5am UTC
      clock.secsUntilJumanjiReset = 60 * 60 * 24 - ((rlDayElapsedS - 5 * 60 * 60) % (60 * 60 * 24));
      if (clock.secsUntilJumanjiReset > 60 * 60 * 24) {
        clock.secsUntilJumanjiReset -= 60 * 60 * 24;
      }

      let secsTillNextThursdayNA = (getNextOccuranceOfUTCDayAndHour(d, 4, 23) - Date.now()) / 1000;
      let secsTillNextSundayNA = (getNextOccuranceOfUTCDayAndHour(d, 7, 23) - Date.now()) / 1000;
      clock.secsUntilVellSpawnNA = secsTillNextThursdayNA < secsTillNextSundayNA ? secsTillNextThursdayNA : secsTillNextSundayNA;

      let secsTillNextThursdayEU = (getNextOccuranceOfUTCDayAndHour(d, 4, 16) - Date.now()) / 1000;
      let secsTillNextSundayEU = (getNextOccuranceOfUTCDayAndHour(d, 7, 16) - Date.now()) / 1000;
      clock.secsUntilVellSpawnEU = secsTillNextThursdayEU < secsTillNextSundayEU ? secsTillNextThursdayEU : secsTillNextSundayEU;
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
      var d = new Date();
      var startHour = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
      var rlDayElapsedS = (Date.now() - startHour) / 1000;
      var secsIntoGameDay = (rlDayElapsedS + 200 * 60 + 20 * 60) % (240 * 60);
      var gameHour;

      // Last part of the shifted day is night
      if (secsIntoGameDay >= 12000) {
        var secsIntoGameNight = secsIntoGameDay - 12000;
        var pctOfNightDone = secsIntoGameNight / (40 * 60);
        gameHour = 9 * pctOfNightDone;
        gameHour = gameHour < 2 ? 22 + gameHour : gameHour - 2;
        var secsUntilNightEnd = 40 * 60 - secsIntoGameNight;

        clock.isDay = false;
        clock.inGameHour = (gameHour / 1) >> 0;
        clock.inGameMinute = ((gameHour % 1) * 60) >> 0;
        clock.secsUntilNightEnd = secsUntilNightEnd;
        clock.secsUntilNightStart = secsUntilNightEnd + 12000;
      } else {
        var secsIntoGameDaytime = secsIntoGameDay;
        var pctOfDayDone = secsIntoGameDay / (200 * 60);
        gameHour = 7 + (22 - 7) * pctOfDayDone;
        var secsUntilNightStart = 12000 - secsIntoGameDaytime;

        clock.isDay = true;
        clock.inGameHour = (gameHour / 1) >> 0;
        clock.inGameMinute = ((gameHour % 1) * 60) >> 0;
        clock.secsUntilNightEnd = secsUntilNightStart + 40 * 60;
        clock.secsUntilNightStart = secsUntilNightStart;
      }
    }

    function updateWeekendEvent() {
      var baselineDay = new Date();
      baselineDay.setUTCMonth(3);
      baselineDay.setUTCDate(5);
      baselineDay.setUTCFullYear(2021);
      baselineDay.setUTCHours(12, 0, 0, 0);

      //var currentDate = new Date("Mon Apr 12 2021 19:00:00");
      var currentDate = new Date();

      var diffInWeeks = GetDifferenceInWeeks(baselineDay, currentDate);

      thisWeekIndex.value = diffInWeeks % weekendEvents.length;
      nextWeekIndex.value = (diffInWeeks + 1) % weekendEvents.length;

      var secsTillNextEventStart = (getNextOccuranceOfUTCDayAndHour(currentDate, 5, 22) - Date.now()) / 1000;
      var secsTillNextEventEnd = (getNextOccuranceOfUTCDayAndHour(currentDate, 1, 12) - Date.now()) / 1000;
      if (secsTillNextEventStart < secsTillNextEventEnd) {
        weekendEvents[thisWeekIndex.value].isActive = false;
        weekendEvents[thisWeekIndex.value].time = secsTillNextEventStart;
        weekendEvents[nextWeekIndex.value].time = secsTillNextEventStart + 60 * 60 * 24 * 7;
      } else if (secsTillNextEventStart > secsTillNextEventEnd) {
        weekendEvents[thisWeekIndex.value].isActive = true;
        weekendEvents[thisWeekIndex.value].time = secsTillNextEventEnd;
        weekendEvents[thisWeekIndex.value].duration =
          (Date.now() - (getNextOccuranceOfUTCDayAndHour(currentDate, 5, 22) - 1000 * 60 * 60 * 24 * 7)) / 1000;
        weekendEvents[nextWeekIndex.value].time = secsTillNextEventStart;
      }
    }

    function GetDifferenceInWeeks(baselineDay, currentDate) {
      var diffInMs = currentDate - baselineDay;

      var msPerDay = 1000 * 60 * 60 * 24;
      var diffInDays = Math.floor(diffInMs / msPerDay);

      var diffInWeeks = Math.floor(diffInDays / 7);
      return diffInWeeks;
    }

    function clockTime(secs) {
      if (secs < 60) {
        return "<1 min";
      } else if (secs < 60 * 60) {
        return ((secs / 60) >> 0) + "m";
      } else {
        return ((secs / 3600) >> 0) + "h" + (((secs % 3600) / 60) >> 0) + "m";
      }
    }

    function getNextOccuranceOfUTCDayAndHour(now, day, hour) {
      let d = new Date(now);
      d.setUTCDate(d.getUTCDate() + ((7 + day - d.getUTCDay()) % 7));
      d.setUTCHours(hour, 0, 0, 0);
      if (d < now) {
        d.setUTCDate(d.getUTCDate() + 7);
      }
      return d;
    }

    function splitResponse(data, splitStr) {
      let firstStart = data.lastIndexOf(splitStr[0]);
      let secondStart = data.lastIndexOf(splitStr[1]);
      var firstData, secondData;
      if (firstStart < secondStart) {
        firstData = data.substring(firstStart + splitStr[0].length, secondStart);
        secondData = data.substring(secondStart + splitStr[1].length);
      } else {
        secondData = data.substring(secondStart + splitStr[1].length, firstStart);
        firstData = data.substring(firstStart + splitStr[0].length);
      }
      return [firstData, secondData];
    }

    const ampm = computed(() => (clock.inGameHour < 12 ? "AM" : "PM"));
    const displayHour = computed(() => {
      var t = clock.inGameHour % 12;
      if (t === 0) {
        t = 12;
      }
      return clock.inGameHour > 0 && clock.inGameHour < 10 ? "0" + +t : t;
    });
    const displayMinute = computed(() => (clock.inGameMinute < 10 ? "0" + +clock.inGameMinute : clock.inGameMinute));

    return { clock, serverStat, weekendEvents, thisWeekIndex, nextWeekIndex, isLoading, error, clockTime, ampm, displayHour, displayMinute };
  },
};
</script>
