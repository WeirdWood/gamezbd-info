import { reactive, toRefs, watch } from "vue";
import serverOptions from "../database/server.json";

const state = reactive({
  storagePermission:
    localStorage.getItem("storagePermission") === "true" ? true : false,
  selectedServer: localStorage.getItem("server")
    ? JSON.parse(localStorage.getItem("server"))
    : serverOptions[0],
});

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
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    //var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return (dDisplay + hDisplay + mDisplay).replace(/,\s*$/, "");
  };

  return {
    ...toRefs(state),
    closeCookieBox,
    serverOptions,
    splitResponse,
    clockTime,
  };
}
