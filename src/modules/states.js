import { reactive, toRefs, watch } from "vue";
import { Notify } from "quasar";
import sortBy from "lodash.sortby";
import serverOptions from "../database/server.json";

var alarmAudio = new Audio("/alarm-effect.mp3");

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
});

if (!localStorage.getItem("server") && state.storagePermission)
  localStorage.setItem("server", JSON.stringify(state.selectedServer));

watch(
  () => state.selectedServer,
  () => {
    if (state.storagePermission) {
      localStorage.setItem("server", JSON.stringify(state.selectedServer));
    } else {
      localStorage.removeItem("server");
    }
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

  const clockTime = (seconds) => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    //var s = Math.floor(seconds % 60);

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

  const addToAlarm = (seconds, label, offset = 0, icon = undefined) => {
    let reachDate = Date.now() + seconds * 1000;
    state.alarmArray.push({
      icon: icon,
      label: label,
      time: reachDate, //UTC miliseconds of the goal time
      offset: offset, //In minutes
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

    if (state.storagePermission) {
      try {
        localStorage.setItem("alarms", JSON.stringify(state.alarmArray));
      }
      catch(err) {
        localStorage.removeItem("alarms");
      }
    }

    Notify.create({
      message: `${label} alarm added!`,
      color: "positive",
      avatar: icon ? icon : "/img/game-icons/unknown-white.svg",
    });
  };

  const evalAlarm = () => {
    let d = Date.now();
    state.alarmArray.forEach((element) => {
      let secs = (element.time - d) / 1000;
      if (secs <= -(60 * 5)) element.remove = true;
      else if (secs <= 0) element.displayCountdown = reverseClockTime(secs);
      else element.displayCountdown = clockTime(secs);

      let alarmPoint = element.time - element.offset * 60 * 1000;
      if (d < alarmPoint) {
        element.notified = false;
      } else if (!element.notified) {
        //Ring the alarm
        alarmAudio.play();
        state.alarmedCount++;

        Notify.create({
          message:
            element.offset === 0
              ? `${element.label} alarm reached!`
              : `${element.label} starting in ${element.displayCountdown}!`,
          color: "positive",
          avatar: element.icon
            ? element.icon
            : "/img/game-icons/unknown-white.svg",
          timeout: 20000,
          progress: true,
        });

        element.notified = true;
      }
    });
    state.alarmArray = state.alarmArray.filter((item) => !item.remove);
  };

  const runAlarm = () => {
    let interval = setInterval(evalAlarm, 1000);
  };

  return {
    ...toRefs(state),
    closeCookieBox,
    serverOptions,
    splitResponse,
    clockTime,
    addToAlarm,
    runAlarm,
    evalAlarm,
  };
}
