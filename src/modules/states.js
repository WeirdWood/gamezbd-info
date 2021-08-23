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
    }
    else {
        localStorage.removeItem("server");
    }
  }
);

export default function useStates() {
  const closeCookieBox = () => {
    localStorage.setItem("storagePermission", "true");
    state.storagePermission = true;
  };

  return { ...toRefs(state), closeCookieBox, serverOptions };
}
