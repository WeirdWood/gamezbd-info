<template>
  <div class="container">
    <q-page class="q-mx-lg">
      <h5 class="q-mb-md text-weight-regular">Enhance Calculator</h5>
      <div class="row">
        <q-card flat class="col-md col-sm-12 col-xs-12 q-mt-md q-mr-md q-pa-md">
          <q-card-section class="q-pa-none q-gutter-y-lg">
            <div class="q-gutter-x-md q-gutter-y-none">
              <q-checkbox v-model="formValues.premium" label="Premium" />
              <q-checkbox v-model="formValues.event" label="Event" />
            </div>
            <div class="q-gutter-md col">
              <q-select
                outlined
                v-model="formValues.formula"
                label="Choose formula"
                :options="formulaStringOptions"
                behavior="menu"
              />
              <a
                class="block q-mt-sm text-secondary cursor-pointer"
                style="width: fit-content; text-decoration: none"
                @click.prevent="alert = true"
              >
                <q-icon
                  name="o_info"
                  style="font-size: 1.125rem; margin-top: -0.125rem"
                />
                What is this?
              </a>
              <q-dialog v-model="alert">
                <q-card>
                  <q-card-section>
                    <div class="text-h6">Formula explanation</div>
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    For having both premium and enhancing event active, these 2
                    formulas differ: <br />
                    <b>Additive</b>: failstack value * (100% + 30% + 20%), an
                    example would be 0.5% * (1 + 0.3 + 0.2) = 0.75% <br />
                    <b>Multiplicative</b>: failstack value * (100% + 30%) *
                    120%, an example would be 0.5% * 1.3 * 1.2 = 0.78% <br />
                    <br />
                    <b>Why does this exist?</b> <br />
                    These 2 formulas for enhancing in this server has both been
                    weirdly confirmed by the server staff, which is just so
                    confusing.
                    <br />
                    Example would be here: <br />
                    <br />
                    For Additive confirmation <br />
                    <q-img
                      :src="`/img/Additive-confirmation.jpg`"
                      alt="additive confirmation"
                      width="100%"
                    />
                    <br />
                    For Multiplicative confirmation <br />
                    <q-img
                      :src="`/img/Multiplicative-confirmation.jpg`"
                      alt="multiplicative confirmation"
                      width="100%"
                    />
                    <br />
                    <br />
                    <b>So which one should I choose?</b> <br />
                    For now, without concrete evidence of which is the correct
                    formula, you can choose either. <br />
                    In my limited experience with enhancing, I believe
                    <b>Additive</b> is the correct formula, and I recommend
                    using that for your calculation.
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn flat label="OK" color="primary" v-close-popup />
                  </q-card-actions>
                </q-card>
              </q-dialog>
              <q-select
                outlined
                v-model="formValues.itemType"
                use-input
                input-debounce="50"
                label="Choose item type"
                :options="itemTypeOptions"
                option-value="id"
                option-label="name"
                @filter="filterFn"
                behavior="menu"
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
                outlined
                v-model.number="formValues.failstack"
                type="number"
                min="0"
                label="Enter failstack"
                mask="###"
                autofocus
                class="q-mb-lg"
              />
            </div>
          </q-card-section>
        </q-card>
        <q-card flat class="col-md col-sm-12 col-xs-12 q-mt-md q-pa-md">
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
              style="height: 12rem;"
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
import itemTypeData from "../database/itemType.json";
import EnhanceTable from "components/enhanceTable.vue";

const formulaStringOptions = ["Additive", "Multiplicative"];

export default defineComponent({
  name: "Enhance Calculator",

  components: {
    EnhanceTable,
  },

  setup() {
    const formValues = reactive({
      premium: false,
      event: false,
      formula: "Additive",
      itemType: itemTypeData[0],
      failstack: 0,
    });
    const itemTypeOptions = ref(itemTypeData);
    const alert = ref(false);
    const simSelectedGrade = ref(0);
    const simResultArr = reactive([]);

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

    const finalBonus = computed(() => {
      let premiumMultiplier = formValues.premium ? 1.3 : 1;
      let eventMultiplier = formValues.event ? 1.2 : 1;
      let multiplier =
        formValues.formula === "Additive"
          ? premiumMultiplier + eventMultiplier - 1
          : premiumMultiplier * eventMultiplier;
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
      formulaStringOptions,
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
    border: 1px solid $separator-color;
    border-radius: $generic-border-radius !important;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
}

.q-dark .btn-group-simulate {
  .q-btn--rounded {
    background-color: darken($dark, 2);
    border-color: darken($dark, 2);
  }
}

.cornered {
  border-radius: $generic-border-radius !important;
}
</style>

<style lang="scss" scoped>
.container {
  max-width: 64rem;
}

.q-scrollarea {
  background-color: $grey-2;
}
</style>