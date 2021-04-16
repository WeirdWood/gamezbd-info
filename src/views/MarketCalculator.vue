<template>
  <div class="container mx-auto px-4 max-w-6xl  flex justify-center">
    <div class="flex flex-col min-w-0 break-words bg-white px-4 py-6 shadow-xl rounded-lg">
      <h6 class="text-xl font-normal leading-normal mt-0 mb-6 text-gray-800">
        Market Calculator
      </h6>

      <div>
        <form @submit.prevent="" autocomplete="off">
          <div class="flex flex-col sm:flex-row mb-4">
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="value"
                id="value"
                v-model="formValues.value"
                class="form-checkbox border-gray-400 rounded text-gray-800 w-5 h-5"
                style="transition: all 0.15s ease 0s;"
              />
              <span class="ml-2 text-sm mt-1 font-medium text-gray-600 select-none">
                Value Pack
              </span>
            </label>
            <label class="flex items-center cursor-pointer ml-0 sm:ml-8">
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
            <label class="flex items-center cursor-pointer ml-0 sm:ml-8">
              <input
                type="checkbox"
                name="merchant"
                id="merchant"
                v-model="formValues.merchant"
                class="form-checkbox border-gray-400 rounded text-gray-800 w-5 h-5"
                style="transition: all 0.15s ease 0s;"
              />
              <span class="ml-2 text-sm mt-1 font-medium text-gray-600 select-none">
                Merchant Ring / Old Moon Pass
              </span>
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <number-input :id="'fame'" :label="'Enter Family Fame'" :fieldName="'fame'" :value="formValues.fame" @update="sync" />
            <div>
              <label class="block text-gray-600 text-sm font-bold mb-2 select-none" for="itemType">
                Silver collection percent
              </label>
              <input
                type="number"
                min="0"
                name="fame"
                id="fame"
                v-model="collectPercent"
                class="px-3 py-3 border-gray-200 placeholder-gray-400 text-gray-700 bg-white rounded text-sm focus:outline-none focus:ring w-full md:w-64"
                style="transition: all 0.15s ease 0s;"
                disabled
              />
            </div>
            <number-input :id="'buyPrice'" :label="'Buy Price'" :fieldName="'buyPrice'" :value="formValues.buyPrice" @update="sync" />
            <number-input :id="'sellPrice'" :label="'Sell Price'" :fieldName="'sellPrice'" :value="formValues.sellPrice" @update="sync" />
            <number-input :id="'amount'" :label="'Amount'" :fieldName="'amount'" :value="formValues.amount" @update="onAmountUpdate" />
            <number-input
              :id="'silver'"
              :label="'Silver Gain/Lose'"
              :fieldName="'silver'"
              :value="formValues.silver"
              :negatable="true"
              @update="onSilverUpdate"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, reactive, watch } from "vue";
import familyFameBonus from "../database/familyFameBonus.json";
import NumberInput from "../components/NumberInput.vue";

export default {
  components: { NumberInput },
  setup() {
    const formValues = reactive({
      premium: false,
      value: false,
      merchant: false,
      fame: "0",
      buyPrice: "0",
      sellPrice: "0",
      amount: "1",
      silver: "0",
      customSilver: false,
    });

    onMounted(() => {
      if (localStorage.getItem("fame")) {
        try {
          formValues.fame = localStorage.getItem("fame");
        } catch (e) {
          localStorage.removeItem("fame");
        }
      }
    });

    onBeforeUnmount(() => {
      localStorage.setItem("fame", formValues.fame);
    });

    function formEval() {
      if (formValues.customSilver) {
        let result = formValues.silver / (formValues.sellPrice * collectPercent.value * 0.01 - formValues.buyPrice);
        if (isFinite(result)) formValues.amount = Math.round((result + Number.EPSILON) * 10) / 10;
        else formValues.amount = 0;
      } else {
        let result = (formValues.sellPrice * collectPercent.value * 0.01 - formValues.buyPrice) * formValues.amount;
        if (isFinite(result)) formValues.silver = Math.round(result);
        else formValues.silver = 0;
      }
    }

    function sync(args) {
      formValues[args.field] = args.value;
    }

    function onAmountUpdate(args) {
      formValues.customSilver = false;
      sync(args);
    }
    function onSilverUpdate(args) {
      formValues.customSilver = true;
      sync(args);
    }

    watch(formValues, () => {
      formEval();
    });

    const collectPercent = computed(() => {
      var fameBonus = 0;
      for (let index = 0; index < familyFameBonus.length; index++) {
        if (formValues.fame >= familyFameBonus[index].threshold) {
          fameBonus = familyFameBonus[index].bonus;
          break;
        }
      }

      let result =
        65 * (1 + (formValues.premium ? 1 : 0) * 0.2 + (formValues.value ? 1 : 0) * 0.3 + (formValues.merchant ? 1 : 0) * 0.05 + fameBonus * 0.01);
      result = Math.min(Math.max(result, 65), 100);
      return Math.round((result + Number.EPSILON) * 1000) / 1000;
    });

    return { formValues, collectPercent, sync, onAmountUpdate, onSilverUpdate };
  },
};
</script>
