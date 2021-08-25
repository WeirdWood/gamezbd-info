<template>
  <div class="container">
    <q-page class="q-mx-md q-py-lg">
      <q-card flat class="q-px-md q-py-lg">
        <h5 class="q-ma-none q-pb-md text-weight-regular text-primary">
          Market Calculator
        </h5>
        <q-card-section class="q-pa-none q-gutter-y-md">
          <div class="q-gutter-x-md q-gutter-y-none">
            <q-checkbox v-model="formValues.value" label="Value Pack" />
            <q-checkbox v-model="formValues.premium" label="Premium" />
            <q-checkbox
              v-model="formValues.merchant"
              label="Merchant Ring/Old Moon Pass"
            />
          </div>

          <div class="row q-gutter-y-md q-mt-none">
            <q-select
              class="col-md col-sm-12 col-xs-12 q-mr-md"
              filled
              v-model="formValues.fame"
              label="Family fame"
              :options="familyFameOptions"
            />
            <q-input
              class="col-md col-sm-12 col-xs-12"
              filled
              :model-value="collectPercent"
              label="Silver collection percent"
              readonly
              suffix="%"
              input-class="text-right"
            />
          </div>
          <div class="row q-gutter-y-md q-mt-none">
            <q-input
              class="col-md col-sm-12 col-xs-12 q-mr-md"
              filled
              v-model="formValues.buyPrice"
              maxlength="20"
              label="Item buy price"
              mask="###.###.###.###.###"
              reverse-fill-mask
              unmasked-value
            />
            <q-input
              class="col-md col-sm-12 col-xs-12"
              filled
              v-model="formValues.sellPrice"
              maxlength="20"
              label="Item sell price"
              mask="###.###.###.###.###"
              reverse-fill-mask
              unmasked-value
            />
          </div>
          <div class="row q-gutter-y-md q-mt-none">
            <q-input
              class="col-md col-sm-12 col-xs-12 q-mr-md"
              filled
              v-model="formValues.amount"
              maxlength="12"
              label="Item amount"
              mask="###.###.###.###.###"
              reverse-fill-mask
              unmasked-value
            />
            <q-input
              class="col-md col-sm-12 col-xs-12"
              filled
              :model-value="formValues.silver"
              label="Silver gain/lose"
              readonly
              mask="###.###.###.###.###"
              reverse-fill-mask
              unmasked-value
              :key="(formValues.silver + 2) * 2"
              :prefix="formValues.silver < 0 ? '-' : ''"
            />
          </div>
          <div class="row q-gutter-y-md q-mt-none">
            <q-input
              class="col-md col-sm-12 col-xs-12 q-mr-md"
              filled
              :model-value="Math.round(silverLost)"
              label="Silver lost to tax"
              readonly
              mask="###.###.###.###.###"
              reverse-fill-mask
              unmasked-value
              :key="silverLost"
            />
            <q-input
              class="col-md col-sm-12 col-xs-12"
              filled
              :model-value="Math.round(formValues.silverLostPerItem)"
              label="Tax lost per item"
              readonly
              mask="###.###.###.###.###"
              reverse-fill-mask
              unmasked-value
              :key="(-formValues.silverLostPerItem + 1) * 2"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-page>
  </div>
</template>

<script>
import {
  defineComponent,
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  watch,
} from "vue";
import useStates from "../modules/states";
import familyFameBonus from "../database/familyFameBonus.json";

export default defineComponent({
  name: "Market Calculator",

  setup() {
    const familyFameOptions = familyFameBonus.map((bonus) => ({
      label: bonus.label,
      value: bonus.threshold,
      bonus: bonus.bonus,
    }));
    const formValues = reactive({
      premium: false,
      value: false,
      merchant: false,
      fame: familyFameOptions[0],
      buyPrice: "0",
      sellPrice: "0",
      amount: "1",
      silver: "0",
      silverLostPerItem: "0",
    });
    const { storagePermission } = useStates();

    onMounted(() => {
      if (!storagePermission.value) {
        localStorage.removeItem("marketConfig");
      } else if (localStorage.getItem("marketConfig")) {
        try {
          let marketConfig = JSON.parse(localStorage.getItem("marketConfig"));
          formValues.premium = marketConfig.premium
            ? marketConfig.premium
            : formValues.premium;
          formValues.value = marketConfig.value
            ? marketConfig.value
            : formValues.value;
          formValues.fame = marketConfig.fame
            ? marketConfig.fame
            : formValues.fame;
        } catch (e) {
          localStorage.removeItem("marketConfig");
        }
      }
    });

    onBeforeUnmount(() => {
      if (storagePermission.value) {
        localStorage.setItem("marketConfig", JSON.stringify(formValues));
      }
    });

    function formEval() {
      let result =
        (formValues.sellPrice * collectPercent.value * 0.01 -
          formValues.buyPrice) *
        formValues.amount;
      if (isFinite(result)) formValues.silver = Math.round(result);
      else formValues.silver = 0;

      formValues.silverLostPerItem =
        Math.round(
          (formValues.sellPrice * (1 - collectPercent.value * 0.01) +
            Number.EPSILON) *
            100
        ) / 100;
    }

    watch(formValues, () => {
      formEval();
    });

    const collectPercent = computed(() => {
      let result =
        65 *
        (1 +
          (formValues.premium ? 1 : 0) * 0.2 +
          (formValues.value ? 1 : 0) * 0.3 +
          (formValues.merchant ? 1 : 0) * 0.05 +
          formValues.fame.bonus * 0.01);
      result = Math.min(Math.max(result, 65), 100);
      return Math.round((result + Number.EPSILON) * 1000) / 1000;
    });

    const silverLost = computed(() => {
      return formValues.silverLostPerItem * formValues.amount;
    });

    return {
      formValues,
      collectPercent,
      silverLost,
      familyFameOptions,
    };
  },
});
</script>
