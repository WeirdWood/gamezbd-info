<template>
  <q-page class="q-ma-lg">
    <h5 class="q-mb-sm text-weight-regular">Enhance Calculator</h5>
    <div class="row q-gutter-md">
      <q-card flat class="col my-card q-pa-md">
        <q-card-section class="q-pa-none">
          <div class="q-gutter-x-md q-gutter-y-lg">
            <q-checkbox v-model="formValues.premium" label="Premium" />
            <q-checkbox v-model="formValues.event" label="Event" />
          </div>
          <div class="q-gutter-x-md q-gutter-y-lg col">
            <q-select
              v-model="formValues.formula"
              label="Choose formula"
              :options="formulaStringOptions"
              behavior="menu"
            />
            <a
              href=""
              class="block q-mt-sm"
              style="width: fit-content; text-decoration: none"
              @click.prevent="alert = true"
              >What is this?</a
            >
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
                  <b>Multiplicative</b>: failstack value * (100% + 30%) * 120%,
                  an example would be 0.5% * 1.3 * 1.2 = 0.78% <br />
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
                  <b>Additive</b> is the correct formula, and I recommend using
                  that for your calculation.
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn flat label="OK" color="primary" v-close-popup />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-select
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
              v-model.number="formValues.failstack"
              type="number"
              label="Enter failstack"
              mask="###"
              autofocus
              class="q-mb-lg"
            />
          </div>
        </q-card-section>
      </q-card>
      <q-card flat class="col my-card q-pa-md">
        <q-card-section class="q-pa-none">
          
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, reactive, ref, watch } from "vue";
import itemTypeData from "../database/itemType.json";

const formulaStringOptions = ["Additive", "Multiplicative"];

export default defineComponent({
  name: "Enhance Calculator",

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

    return {
      formValues,
      formulaStringOptions,
      itemTypeOptions,
      alert,
      filterFn,
    };
  },
});
</script>
