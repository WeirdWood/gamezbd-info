import { reactive, toRefs, watch } from "vue";
import { Notify } from "quasar";
import sortBy from "lodash.sortby";
import serverOptions from "../database/server.json";
import alarmAudioSrc from "../assets/alarm-effect.mp3";

var alarmAudio = new Audio(alarmAudioSrc);

const state = reactive({
  storagePermission:
    localStorage.getItem("storagePermission") === "true" ? true : false,
  selectedServer: localStorage.getItem("server")
    ? JSON.parse(localStorage.getItem("server"))
    : serverOptions[0],
  alarmArray: localStorage.getItem("alarms")
    ? JSON.parse(localStorage.getItem("alarms"))
    : [],
  alarmedCount: 0,
  alarmStoreNeedsUpdate: false,
});

if (!localStorage.getItem("server"))
  localStorage.setItem("server", JSON.stringify(state.selectedServer));

watch(
  () => state.selectedServer,
  () => {
    localStorage.setItem("server", JSON.stringify(state.selectedServer));
    location.reload();
  }
);

export default function useStates() {
  const closeCookieBox = () => {
    localStorage.setItem("storagePermission", "true");
    state.storagePermission = true;
  };

  const splitResponse = (data, splitStr) => {
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
  };

  const clockTime = (seconds, isVell = false) => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    //var s = Math.floor(seconds % 60);

    if (isVell && d === 0 && h === 0 && m < 30) {
      return (
        "spawning (" +
        (m > 0 ? m + (m == 1 ? " minute" : " minutes") : "<1 minute") +
        ")"
      );
    }
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute" : " minutes") : "<1 minute";
    //var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return (dDisplay + hDisplay + mDisplay).replace(/,\s*$/, "");
  };

  const reverseClockTime = (seconds) => {
    seconds = Number(seconds);
    let m = Math.floor(-seconds / 60);
    let mDisplay =
      m > 0 ? m + (m == 1 ? " minute ago" : " minutes ago") : "<1 minute ago";
    return mDisplay;
  };

  const addToAlarm = (reachDate, label, offset = 0, icon = undefined) => {
    let notified = reachDate < Date.now() ? true : false;
    state.alarmArray.push({
      icon: icon,
      label: label,
      time: reachDate, //UTC miliseconds of the goal time
      offset: offset, //In minutes,
      notified: notified,
    });

    //Deduplicating alarms
    state.alarmArray = state.alarmArray.filter(
      (element, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.label === element.label && Math.abs(t.time - element.time) < 10000
        )
    );

    state.alarmArray = sortBy(state.alarmArray, "time");

    storeAlarm();

    Notify.create({
      message: `${label} alarm added!`,
      color: "positive",
      avatar: icon ? icon : "/img/game-icons/unknown.png",
    });
  };

  const evalAlarm = () => {
    let d = Date.now();
    for (const element of state.alarmArray) {
      let secs = (element.time - d) / 1000;
      if (secs <= 60 * 5) element.close = true;
      if (secs <= -(60 * 20)) element.remove = true;
      //This needs to last longer than boss timer or inAlarm check will fail.
      else if (secs <= 0) {
        element.displayCountdown = reverseClockTime(secs);
        element.reached = true;
      } else {
        if (element.label.includes("Vell"))
          element.displayCountdown = clockTime(secs, true);
        else element.displayCountdown = clockTime(secs);
      }

      let alarmPoint = element.time - element.offset * 60 * 1000;
      if (d < alarmPoint) {
        element.notified = false;
      } else if (!element.notified && !element.remove) {
        //Ring the alarm
        element.notified = true;
        state.alarmedCount++;

        Notify.create({
          message:
            element.offset === 0
              ? `${element.label} alarm reached!`
              : `${element.label} starting in ${element.displayCountdown}!`,
          color: "positive",
          avatar: element.icon ? element.icon : "/img/game-icons/unknown.png",
          timeout: 20000,
          progress: true,
          actions: [
            {
              label: "Dismiss",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });

        alarmAudio.play();
      }
    }

    let beforeRemoveLength = state.alarmArray.length;
    state.alarmArray = state.alarmArray.filter((item) => !item.remove);

    if (state.alarmArray.length < beforeRemoveLength) storeAlarm();

    if (state.alarmStoreNeedsUpdate) {
      storeAlarm();
      state.alarmStoreNeedsUpdate = false;
    }
  };

  const runAlarm = () => {
    return setInterval(evalAlarm, 2000);
  };

  const storeAlarm = () => {
    if (state.storagePermission) {
      try {
        localStorage.setItem("alarms", JSON.stringify(state.alarmArray));
      } catch (err) {
        localStorage.removeItem("alarms");
      }
    }
  };

  const getNextOccuranceOfUTCDayAndHour = (now, day, hour, minute = 0) => {
    let d = new Date(now);
    let utcDate = new Date(
      Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate() + ((7 + day - d.getUTCDay()) % 7),
        hour,
        minute
      )
    );
    if (utcDate < now) {
      utcDate.setUTCDate(utcDate.getUTCDate() + 7);
    }
    return utcDate;
  };

  return {
    ...toRefs(state),
    alarmAudio,
    closeCookieBox,
    serverOptions,
    splitResponse,
    clockTime,
    reverseClockTime,
    addToAlarm,
    runAlarm,
    evalAlarm,
    storeAlarm,
    getNextOccuranceOfUTCDayAndHour,
  };
}
