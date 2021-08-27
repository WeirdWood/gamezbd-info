<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white q-py-sm">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="text-weight-medium">
          GamezBD Info
        </q-toolbar-title>

        <div>
          <q-select
            borderless
            dense
            class="server-select"
            v-model="selectedServer"
            :options="serverOptions"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :mini="miniState"
      :width="250"
      class="column"
    >
      <q-scroll-area
        class="col hide-scrollbar"
        style="overflow: hidden"
        :visible="false"
      >
        <q-list padding>
          <q-item to="/fs-calculator" exact clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="add_chart" />
            </q-item-section>

            <q-item-section> Enhance Calculator </q-item-section>
          </q-item>
          <q-item to="/market-calculator" exact clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="storefront" />
            </q-item-section>

            <q-item-section> Market Calculator </q-item-section>
          </q-item>
          <q-item to="/boss-timer" exact clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="pending_actions" />
            </q-item-section>

            <q-item-section> Boss Timer </q-item-section>
          </q-item>

          <q-item to="/timer" exact clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="timer" />
            </q-item-section>

            <q-item-section> Timer </q-item-section>
          </q-item>
          <q-item to="/info" exact clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="help_outline" />
            </q-item-section>

            <q-item-section> Info </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>

            <q-item-section>
              <q-toggle v-model="darkMode" color="primary" label="Dark Mode" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view></router-view>

      <q-page-sticky position="bottom-right" :offset="[24, 24]">
        <q-btn
          rounded
          color="secondary"
          icon="alarm"
          label="Alarm"
          padding="0.75rem 1rem"
          @click="
            showAlarm = true;
            alarmedCount = 0;
          "
        >
          <q-badge v-if="alarmedCount > 0" color="red" floating>
            {{ alarmedCount }}
          </q-badge>
        </q-btn>
      </q-page-sticky>

      <q-dialog v-model="showAlarm">
        <q-card class="full-width" style="max-width: 1024px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Alarms</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-table
              :rows="alarmArray"
              :columns="columns"
              row-key="name"
              :pagination="{ rowsPerPage: 10 }"
              flat
              bordered
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
                    {{ props.row.label }}
                  </q-td>

                  <q-td key="time" :props="props">
                    {{ props.row.displayCountdown }}
                  </q-td>

                  <q-td key="offset" :props="props">
                    {{ props.row.offset }} minutes
                    <q-popup-edit
                      v-model.number="props.row.offset"
                      title="Update delay time"
                      buttons
                      :validate="rangeValidation"
                      @hide="rangeValidation"
                      v-slot="scope"
                    >
                      <q-input
                        type="number"
                        v-model.number="scope.value"
                        hint="Enter a number between 0 and 60"
                        :error="errorVal"
                        :error-message="errorValMsg"
                        dense
                        autofocus
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                  </q-td>

                  <q-td key="action" :props="props">
                    <q-btn
                      dense
                      round
                      flat
                      color="grey"
                      @click="removeAlarm(props)"
                      icon="delete"
                    >
                      <q-tooltip class="text-body2"> Delete alarm </q-tooltip>
                    </q-btn>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-page-container>

    <q-footer v-if="!storagePermission" class="cookie-footer text-white">
      <div class="row items-center q-pa-md">
        <p class="col text-body1 q-ma-none q-mr-sm">
          This website uses cookies to ensure you get the best experience on our
          website.
        </p>
        <q-btn
          class="col-grow"
          color="secondary"
          unelevated
          rounded
          padding="0.5rem 3rem"
          label="Got it!"
          @click="closeCookieBox()"
        />
      </div>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import useStates from "../modules/states";

const columns = [
  {
    name: "name",
    label: "Name",
    align: "left",
    field: "label",
  },
  {
    name: "time",
    label: "Time Left",
    field: "displayCountdown",
  },
  {
    name: "offset",
    label: "Notify Early",
    field: "offset",
  },
  {
    name: "action",
    label: "Action",
    field: "",
    align: "center",
  },
];

export default defineComponent({
  name: "MainLayout",

  setup() {
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);
    const miniState = ref(false);
    const darkMode = ref(
      localStorage.getItem("darkMode")
        ? localStorage.getItem("darkMode") === "true"
          ? true
          : false
        : $q.dark.isActive
    );
    const showAlarm = ref(false);
    const {
      storagePermission,
      serverOptions,
      selectedServer,
      alarmArray,
      closeCookieBox,
      runAlarm,
      evalAlarm,
      alarmedCount,
      alarmStoreNeedsUpdate,
    } = useStates();
    const errorVal = ref(false);
    const errorValMsg = ref("");
    const interval = ref(null);

    onMounted(() => {
      interval.value = runAlarm();
    });

    onBeforeUnmount(() => {
      clearInterval(interval.value);
    });

    function toggleLeftDrawer() {
      if (window.innerWidth > 1023) miniState.value = !miniState.value;
      else {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      }
    }

    function rangeValidation(val) {
      if (val < 0 || val > 60) {
        errorVal.value = true;
        errorValMsg.value = "The value must be between 0 and 60!";
        return false;
      }
      errorVal.value = false;
      errorValMsg.value = "";
      alarmStoreNeedsUpdate.value = true;
      return true;
    }

    function removeAlarm(props) {
      props.row.remove = true;
      evalAlarm();
      $q.notify({
        message: `${props.row.label} alarm deleted!`,
        color: "negative",
        avatar: props.row.icon ? props.row.icon : "/img/game-icons/unknown.png",
      });
    }

    $q.dark.set(darkMode.value); //Set dark mode on initial render

    watch(darkMode, () => {
      $q.dark.set(darkMode.value);
      if (storagePermission.value)
        localStorage.setItem("darkMode", darkMode.value);
    });

    return {
      alarmArray,
      columns,
      leftDrawerOpen,
      miniState,
      darkMode,
      showAlarm,
      storagePermission,
      selectedServer,
      serverOptions,
      errorVal,
      errorValMsg,
      alarmedCount,
      toggleLeftDrawer,
      closeCookieBox,
      removeAlarm,
      rangeValidation,
    };
  },
});
</script>

<style lang="scss">
.cookie-footer {
  background-color: #424851;
}
.server-select {
  .q-field__native,
  .q-field__append {
    color: white !important;
  }
  .q-field__native {
    margin-left: 0.75rem;
  }
}
</style>
