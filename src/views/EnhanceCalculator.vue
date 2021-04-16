<template>
  <div class="container mx-auto px-4 flex justify-center">
    <div class="flex flex-col min-w-0 break-words bg-white w-min px-4 py-6 shadow-xl rounded-lg">
      <h6 class="text-xl font-normal leading-normal mt-0 mb-6 text-gray-800">
        Enhance Calculator
      </h6>

      <div class="flex flex-col md:flex-row">
        <form @submit.prevent="" autocomplete="off">
          <div class="flex mb-4">
            <label class="flex items-center cursor-pointer">
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
            <label class="flex items-center cursor-pointer ml-8">
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

          <div class="w-full mb-4">
            <label class="block text-gray-600 text-sm font-bold mb-2 select-none" for="itemType">
              Choose item type
            </label>
            <select
              name="itemType"
              id="itemType"
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
          <input
            class="bg-gray-400 text-white active:bg-gray-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none cursor-pointer focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
            value="Clear"
            @click="clearForm"
          />
        </form>

        <div class="ml-0 md:ml-12 mt-4 md:mt-0">
          <label class="block text-gray-600 text-sm font-bold mb-2 select-none">
            Final chances
          </label>
          <table class="items-center w-full border-collapse bg-transparent">
            <thead>
              <tr>
                <th
                  class="px-3 sm:px-6 bg-gray-100 text-gray-500 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-r-0 whitespace-nowrap font-medium text-left"
                >
                  Grade
                </th>
                <th
                  class="px-3 sm:px-6 bg-gray-100 text-gray-500 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-medium text-left"
                >
                  Base chance
                </th>
                <th
                  class="px-3 sm:px-6 bg-gray-100 text-gray-500 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 whitespace-nowrap font-medium text-left"
                >
                  Success rate
                </th>
              </tr>
            </thead>
            <tbody class="border">
              <tr v-for="(baseRate, index) in itemTypes[formValues.itemTypeId].baseRates" :key="index">
                <th class="px-3 sm:px-6 align-middle text-xs whitespace-nowrap p-4 text-left uppercase">
                  {{ baseRate.name }}
                </th>
                <td class="px-3 sm:px-6 align-middle text-xs whitespace-nowrap p-4 text-left uppercase">{{ baseRate.rate }}%</td>
                <td class="px-3 sm:px-6 align-middle text-xs whitespace-nowrap p-4 text-left uppercase">{{ round(baseRate.rate + finalBonus) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, reactive, ref, watch } from "vue";
import itemTypeData from "../database/itemType.json";

export default {
  setup() {
    const formValues = reactive({
      premium: false,
      event: false,
      itemTypeId: 0,
      failstack: 0,
    });
    const itemTypes = reactive(itemTypeData);
    const fsInput = ref(null);

    onMounted(() => fsInput.value.focus());

    function clearForm() {
      formValues.premium = false;
      formValues.event = false;
      formValues.itemTypeId = 0;
      formValues.failstack = 0;
    }

    function round(number) {
      return Math.round((number + Number.EPSILON) * 100) / 100;
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

    const finalBonus = computed(() => {
      let multiplier = 1 + (formValues.premium ? 0.3 : 0) + (formValues.event ? 0.2 : 0);
      return formValues.failstack * itemTypes[formValues.itemTypeId].fsValue * multiplier;
    });

    return { itemTypes, formValues, clearForm, round, finalBonus, fsInput };
  },
};
</script>
