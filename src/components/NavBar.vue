<template>
  <nav class="relative flex flex-wrap items-center justify-between px-2 py-3 bg-gray-500 mb-12">
    <div class="container px-4 mx-auto flex flex-wrap items-center justify-between">
      <div class="w-full relative flex justify-between lg:w-auto  px-4 lg:static lg:block lg:justify-start">
        <router-link class="text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-white" to="/">
          GameZBD Info
        </router-link>
        <button
          class="text-white cursor-pointer text-xl leading-none px-2 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
          type="button"
          v-on:click="toggleNavbar()"
        >
          <img src="../assets/cil_hamburger-menu.svg" alt="Menu" class="w-8 h-8">
        </button>
      </div>
      <div v-bind:class="{ hidden: !showMenu, flex: showMenu }" class="lg:flex lg:flex-grow items-center">
        <ul class="flex flex-col lg:flex-row list-none ml-auto">
          <li class="nav-item">
            <router-link class="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75" to="/fs-calculator">
              Enhance Calculator
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75" to="/market-calculator">
              Market Calculator
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75" to="/timer">
              Timer
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75" to="/info">
              Info
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "pink-navbar",
  data() {
    return {
      showMenu: false,
    };
  },
  methods: {
    toggleNavbar: function() {
      this.showMenu = !this.showMenu;
    },
  },
};
</script>
