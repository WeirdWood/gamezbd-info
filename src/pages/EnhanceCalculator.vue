<template>
  <div class="container">
    <q-page class="q-mx-md q-py-lg">
      <div class="row q-gutter-y-md">
        <q-card flat class="col-md col-sm-12 col-xs-12 q-mr-md q-px-md q-py-lg">
          <h5 class="q-ma-none q-pb-md text-weight-regular text-primary">
            Enhance Calculator
          </h5>
          <q-card-section class="q-pa-none q-gutter-y-lg">
            <div class="q-gutter-x-md q-gutter-y-none">
              <q-checkbox v-model="formValues.premium" label="Premium">
                <q-tooltip class="text-body2" :offset="[8, 8]">
                  Premium bonus will show in the game's UI even if disabled in
                  premium config (real chance still change accordingly)
                </q-tooltip>
              </q-checkbox>
              <q-checkbox v-model="formValues.event" label="Event">
                <q-tooltip class="text-body2" :offset="[8, 8]">
                  Event bonus will not show in the game's UI (real chance still
                  change accordingly)
                </q-tooltip>
              </q-checkbox>
            </div>
            <div class="q-gutter-md col">
              <q-select
                filled
                v-model="formValues.itemType"
                use-input
                input-debounce="50"
                label="Choose item type"
                :options="itemTypeOptions"
                option-value="id"
                option-label="name"
                @filter="filterFn"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input
                filled
                v-model.number="formValues.failstack"
                type="number"
                min="0"
                label="Enter failstack"
                autofocus
                class="q-mb-lg"
              />
            </div>
          </q-card-section>
        </q-card>
        <q-card flat class="col-md col-sm-12 col-xs-12 q-px-md q-py-lg">
          <q-card-section class="q-pa-none">
            <enhance-table
              :baseRates="formValues.itemType.baseRates"
              :bonus="finalBonus"
            />
          </q-card-section>
        </q-card>
      </div>
      <q-card flat class="q-pa-md q-mt-md q-ml-none q-gutter-md">
        <div class="row q-ma-none">
          <div class="col-md-8 col-sm-12 col-xs-12 q-mb-md">
            <div class="text-h6 text-weight-regular q-mb-md">
              Simulate Enhance
            </div>
            <q-btn-toggle
              v-model="simSelectedGrade"
              class="full-width btn-group-simulate justify-center"
              toggle-color="primary"
              :options="simGradeOptions"
              padding="0.75rem 1rem"
              unelevated
              rounded
            />
          </div>
          <div class="col-md-4 col-sm-12 col-xs-12">
            <q-btn
              color="primary"
              label="Simulate"
              padding="0.75rem 1rem"
              class="full-width q-mb-sm cornered"
              @click="simulate()"
            />
            <q-scroll-area
              class="full-width cornered q-pa-md"
              style="height: 12rem"
            >
              <p
                v-for="result in simResultArr.slice().reverse()"
                :key="result"
                :class="{
                  'text-positive': result.result,
                  'text-negative': !result.result,
                }"
              >
                {{ result.resultText }}
              </p>
            </q-scroll-area>
          </div>
        </div>
      </q-card>
    </q-page>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, watch, computed } from "vue";
import useStates from "../modules/states";
import itemTypeData from "../database/itemType.json";
import EnhanceTable from "components/enhanceTable.vue";

export default defineComponent({
  name: "Enhance Calculator",

  components: {
    EnhanceTable,
  },

  setup() {
    const formValues = reactive({
      premium: false,
      event: false,
      itemType: itemTypeData[0],
      failstack: 0,
    });
    const itemTypeOptions = itemTypeData;
    const simSelectedGrade = ref(0);
    const simResultArr = reactive([]);
    const { storagePermission } = useStates();

    if (!storagePermission.value) {
      localStorage.removeItem("enhanceConfig");
    } else if (localStorage.getItem("enhanceConfig")) {
      try {
        let enhanceConfig = JSON.parse(localStorage.getItem("enhanceConfig"));
        formValues.premium = enhanceConfig.premium
          ? enhanceConfig.premium
          : formValues.premium;
        formValues.event = enhanceConfig.event
          ? enhanceConfig.event
          : formValues.event;
      } catch (e) {
        localStorage.removeItem("enhanceConfig");
      }
    }

    function filterFn(val, update) {
      if (val === "") {
        update(() => {
          itemTypeOptions.value = itemTypeData;
        });
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        itemTypeOptions.value = itemTypeData.filter(
          (v) => v.name.toLowerCase().indexOf(needle) > -1
        );
      });
    }

    function round(number) {
      return Math.round((number + Number.EPSILON) * 100) / 100;
    }

    function simulate() {
      const baseRate = formValues.itemType.baseRates[simSelectedGrade.value];
      var finalRate = baseRate.rate + finalBonus.value;
      var simValue = Math.random() * 100;

      if (simValue <= finalRate) {
        simResultArr.push({
          result: 1,
          resultText: `${baseRate.name} - ${
            formValues.failstack
          }FS - success: ${round(simValue)}`,
        });
      } else {
        simResultArr.push({
          result: 0,
          resultText: `${baseRate.name} - ${
            formValues.failstack
          }FS - failed: ${round(simValue)}`,
        });
      }
    }

    watch(
      () => formValues.failstack,
      () => {
        if (formValues.failstack === "") formValues.failstack = 0;
        if (formValues.failstack < 0) formValues.failstack = 0; //Reset fs back to 0 if user enter a negative number
        if (/^[0][0-9]/.test(formValues.failstack))
          formValues.failstack = formValues.failstack.slice(
            1,
            formValues.failstack.length
          ); //Remove leading 0's
        if (formValues.failstack.toString().length > 3)
          formValues.failstack = parseInt(
            formValues.failstack.toString().slice(0, 3)
          ); //Prevent fs length to go beyond 3 numbers
      }
    );

    watch(
      () => formValues.itemType,
      () => {
        simSelectedGrade.value = 0;
      }
    );

    watch(
      () => [formValues.premium, formValues.event],
      () => {
        if (storagePermission.value) {
          localStorage.setItem("enhanceConfig", JSON.stringify(formValues));
        }
      }
    );

    const finalBonus = computed(() => {
      let premiumMultiplier = formValues.premium ? 1.3 : 1;
      let eventMultiplier = formValues.event ? 1.2 : 1;
      let multiplier = premiumMultiplier * eventMultiplier;
      return (
        formValues.failstack *
        itemTypeData[formValues.itemType.id].fsValue *
        multiplier
      );
    });

    const simGradeOptions = computed(() => {
      return formValues.itemType.baseRates.map((baseRate, index) => ({
        label: baseRate.name,
        value: index,
        rate: baseRate.rate,
      }));
    });

    return {
      formValues,
      itemTypeOptions,
      alert,
      simSelectedGrade,
      filterFn,
      finalBonus,
      simGradeOptions,
      simResultArr,
      simulate,
    };
  },
});
</script>

<style lang="scss">
.btn-group-simulate {
  flex-wrap: wrap !important;

  .q-btn--rounded {
    background-color: $grey-2;
    border-radius: $generic-border-radius !important;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
}

.q-dark .btn-group-simulate {
  .q-btn--rounded {
    background-color: rgba(white, 0.12);
  }
}
</style>

<style lang="scss" scoped>
.q-scrollarea {
  background-color: $grey-2;
}
</style>
