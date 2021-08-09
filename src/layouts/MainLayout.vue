<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white q-pa-sm">
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

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :mini="miniState"
      :width="250"
      :breakpoint="600"
      bordered
    >
      <q-scroll-area class="fit hide-scrollbar">
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
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="bg-grey-2">
      <router-view></router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const leftDrawerOpen = ref(false);
    const miniState = ref(false);

    return {
      leftDrawerOpen,
      miniState,
      toggleLeftDrawer() {
        miniState.value = !miniState.value;
      },
    };
  },
});
</script>
