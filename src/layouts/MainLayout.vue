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
      <q-scroll-area class="col hide-scrollbar" style="overflow: hidden" :visible="false">
        <q-list padding>
          <q-item to="/fs-calculator" exact clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="o_add_chart" />
            </q-item-section>

            <q-item-section> Enhance Calculator </q-item-section>
          </q-item>
          <q-item to="/market-calculator" exact clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="o_storefront" />
            </q-item-section>

            <q-item-section> Market Calculator </q-item-section>
          </q-item>
          <q-item to="/timer" exact clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="o_timer" />
            </q-item-section>

            <q-item-section> Timer </q-item-section>
          </q-item>
          <q-item to="/info" exact clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="o_info" />
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
import { defineComponent, ref, watch } from "vue";
import { useQuasar } from "quasar";
import useStates from "../modules/states";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);
    const miniState = ref(false);
    const darkMode = ref($q.dark.isActive);
    const { storagePermission, serverOptions, selectedServer, closeCookieBox } =
      useStates();

    function setDarkMode() {
      $q.dark.toggle();
    }

    function toggleLeftDrawer() {
      if (window.innerWidth > 1023) miniState.value = !miniState.value;
      else {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      }
    }

    watch(darkMode, () => {
      $q.dark.set(darkMode.value);
    });

    return {
      leftDrawerOpen,
      miniState,
      darkMode,
      storagePermission,
      selectedServer,
      serverOptions,
      toggleLeftDrawer,
      setDarkMode,
      closeCookieBox,
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
