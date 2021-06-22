<template>
  <div class="container mx-auto px-4 flex justify-center">
    <div class="flex flex-col min-w-0 break-words bg-white w-min px-4 py-6 shadow-xl rounded-lg">
      <h6 class="text-xl font-normal leading-normal mt-0 mb-6 text-gray-800">
        Enhance Calculator
      </h6>

      <div class="flex flex-col md:flex-row">
        <form @submit.prevent="" autocomplete="off">
          <div class="flex mb-4">
            <label class="flex items-center cursor-pointer" title="+30%">
              <input
                type="checkbox"
                name="premium"
                id="premium"
                v-model="formValues.premium"
                class="form-checkbox border-gray-400 rounded text-gray-800 w-5 h-5"
                style="transition: all 0.15s ease 0s;"
              />
              <span class="ml-2 text-sm mt-1 font-medium text-gray-600 select-none">
                Premium
              </span>
            </label>
            <label class="flex items-center cursor-pointer ml-8" title="+20%">
              <input
                type="checkbox"
                name="event"
                id="event"
                v-model="formValues.event"
                class="form-checkbox border-gray-400 rounded text-gray-800 w-5 h-5"
                style="transition: all 0.15s ease 0s;"
              />
              <span class="ml-2 text-sm mt-1 font-medium text-gray-600 select-none">
                Event
              </span>
            </label>
          </div>

          <div class="w-full mb-2">
            <label class="block text-gray-600 text-sm font-bold mb-2 select-none" for="itemType">
              Choose formula
            </label>
            <select
              name="formula"
              id="formula"
              v-model="formValues.formula"
              class="px-3 py-3 border-gray-400 placeholder-gray-400 text-gray-700 bg-white rounded text-sm focus:outline-none focus:ring w-full md:w-64"
              style="transition: all 0.15s ease 0s;"
            >
              <option value="additive"> Additive </option>
              <option value="multiplicative"> Multiplicative </option>
            </select>
            <button class="text-blue-500 text-sm mt-2" @click="togglePopup()">What is this?</button>
          </div>
          <div class="w-full mb-4">
            <label class="block text-gray-600 text-sm font-bold mb-2 select-none" for="itemTypes">
              Choose item type
            </label>
            <select
              name="itemType"
              id="itemTypes"
              v-model="formValues.itemTypeId"
              class="px-3 py-3 border-gray-400 placeholder-gray-400 text-gray-700 bg-white rounded text-sm focus:outline-none focus:ring w-full md:w-64"
              style="transition: all 0.15s ease 0s;"
            >
              <option v-for="item in itemTypes" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
          <div class="w-full mb-4">
            <label class="block text-gray-600 text-sm font-bold mb-2 select-none" for="itemType">
              Enter failstack number
            </label>
            <input
              type="number"
              min="0"
              name="itemType"
              id="itemType"
              v-model="formValues.failstack"
              class="px-3 py-3 border-gray-400 placeholder-gray-400 text-gray-700 bg-white rounded text-sm focus:outline-none focus:ring w-full md:w-64"
              style="transition: all 0.15s ease 0s;"
              ref="fsInput"
            />
            <span class="text-sm text-red-500">
              {{
                formValues.failstack !== 0 && itemTypes[formValues.itemTypeId].fsValue === 0
                  ? "Failstack does not have an effect on this item type."
                  : ""
              }}
            </span>
          </div>
        </form>

        <div class="ml-0 md:ml-12 mt-4 md:mt-0">
          <label class="block text-gray-600 text-sm font-bold mb-2 select-none">
            Final chances
          </label>
          <table class="items-center w-full border-collapse bg-transparent">
            <thead>
              <tr>
                <th
                  class="px-2 sm:px-4 bg-gray-100 text-gray-500 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-r-0 whitespace-nowrap font-medium text-left"
                >
                  Grade
                </th>
                <th
                  class="px-2 sm:px-4 hidden sm:block bg-gray-100 text-gray-500 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-medium text-left"
                >
                  Base chance
                </th>
                <th
                  class="px-2 sm:px-4 bg-gray-100 text-gray-500 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-medium text-left"
                >
                  Success rate
                </th>
                <th
                  class="px-2 sm:px-4 bg-gray-100 text-gray-500 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 whitespace-nowrap font-medium text-left"
                >
                  Simulate
                </th>
              </tr>
            </thead>
            <tbody class="border" :key="reRender">
              <tr v-for="(baseRate, index) in itemTypes[formValues.itemTypeId].baseRates" :key="index">
                <th class="px-2 sm:px-4 align-middle text-xs whitespace-nowrap p-4 text-left uppercase">
                  {{ baseRate.name }}
                </th>
                <td class="px-2 sm:px-4 hidden sm:block align-middle text-xs whitespace-nowrap p-4 text-left uppercase">{{ baseRate.rate }}%</td>
                <td class="px-2 sm:px-4 align-middle text-xs whitespace-nowrap p-4 text-left uppercase">{{ round(baseRate.rate + finalBonus) }}%</td>
                <td class="px-2 sm:px-4 align-middle text-xs whitespace-nowrap p-2 text-left uppercase">
                  <button
                    class="p-2 bg-white active:bg-gray-200 border w-full h-full rounded hover:shadow-sm outline-none cursor-pointer focus:outline-none ease-linear transition-all duration-150"
                    @click="simulate(baseRate.rate + finalBonus, index)"
                  >
                    <span
                      class="transition-all duration-150"
                      :class="{ 'text-green-500': baseRate.simStatus === 'Success', 'text-red-600': baseRate.simStatus === 'Fail' }"
                    >
                      {{ baseRate.simStatus === undefined ? "Simulate" : baseRate.simStatus === null ? "&nbsp;" : baseRate.simStatus }}
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <popup ref="popupRef" />
</template>

<script>
import { computed, onMounted, onBeforeUnmount, reactive, ref, watch } from "vue";
import Popup from "../components/Popup.vue";
import itemTypeData from "../database/itemType.json";

export default {
  components: {
    Popup,
  },

  setup() {
    const formValues = reactive({
      premium: false,
      event: false,
      formula: "additive",
      itemTypeId: 0,
      failstack: 0,
    });
    const itemTypes = reactive(itemTypeData);
    const fsInput = ref(null);
    const reRender = ref(0);
    const popupRef = ref();

    onMounted(() => {
      fsInput.value.focus();

      if (localStorage.getItem("enhanceConfig")) {
        try {
          let enhanceConfig = JSON.parse(localStorage.getItem("enhanceConfig"));
          formValues.premium = enhanceConfig.premium ? enhanceConfig.premium : formValues.premium;
          formValues.event = enhanceConfig.event ? enhanceConfig.event : formValues.event;
          formValues.formula = enhanceConfig.formula ? enhanceConfig.formula : formValues.formula;
        } catch (e) {
          localStorage.removeItem("enhanceConfig");
        }
      }
    });

    onBeforeUnmount(() => {
      localStorage.setItem("enhanceConfig", JSON.stringify(formValues));
    });

    function round(number) {
      return Math.round((number + Number.EPSILON) * 100) / 100;
    }

    function simulate(rate, index) {
      let d = Date.now();
      var baseRate = itemTypes[formValues.itemTypeId].baseRates[index];
      if (baseRate.simulateTimestamp === undefined) baseRate.simulateTimestamp = Date.now() - 1000;
      if (d - baseRate.simulateTimestamp > 500) {
        baseRate.simulateTimestamp = d;
        if (Math.random() <= rate * 0.01) {
          baseRate.simStatus = null;
          setTimeout(() => {
            baseRate.simStatus = "Success";
          }, 150);
        } else {
          baseRate.simStatus = null;
          setTimeout(() => {
            baseRate.simStatus = "Fail";
          }, 150);
        }
      }

      setTimeout(() => {
        if (Date.now() - baseRate.simulateTimestamp >= 5000) {
          baseRate.simStatus = undefined;
        }
      }, 5000);
    }

    function togglePopup() {
      popupRef.value.open = true;
    }

    watch(
      () => formValues.failstack,
      () => {
        if (formValues.failstack === "") formValues.failstack = 0;
        if (formValues.failstack < 0) formValues.failstack = 0; //Reset fs back to 0 if user enter a negative number
        if (/^[0][0-9]/.test(formValues.failstack)) formValues.failstack = formValues.failstack.slice(1, formValues.failstack.length); //Remove leading 0's
        if (formValues.failstack.toString().length > 3) formValues.failstack = formValues.failstack.slice(0, 3); //Prevent fs length to go beyond 3 numbers
      }
    );

    watch(
      () => formValues.itemTypeId,
      () => {
        reRender.value++;
      }
    );

    const finalBonus = computed(() => {
      let premiumMultiplier = formValues.premium ? 1.3 : 1;
      let eventMultiplier = formValues.event ? 1.2 : 1;
      let multiplier = formValues.formula === "additive" ? premiumMultiplier + eventMultiplier - 1 : premiumMultiplier * eventMultiplier;
      return formValues.failstack * itemTypes[formValues.itemTypeId].fsValue * multiplier;
    });

    return { itemTypes, formValues, round, togglePopup, finalBonus, fsInput, simulate, reRender, popupRef };
  },
};
</script>
