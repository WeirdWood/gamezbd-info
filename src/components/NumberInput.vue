<template>
  <div>
    <label class="block text-gray-600 text-sm font-bold mb-2 select-none" :for="id">
      {{ label }}
    </label>
    <input
      v-show="visible === true"
      type="number"
      min="0"
      :name="id"
      :id="id"
      :value="value"
      class="px-3 py-3 border-gray-400 placeholder-gray-400 text-gray-700 bg-white rounded text-sm focus:outline-none focus:ring w-full md:w-64"
      style="transition: all 0.15s ease 0s;"
      @input="refresh($event.target.value)"
      @blur="onBlurNumber"
      ref="numberInput"
    />
    <input
      v-show="visible === false"
      type="text"
      v-model="stringValue"
      class="px-3 py-3 border-gray-400 placeholder-gray-400 text-gray-700 bg-white rounded text-sm focus:outline-none focus:ring w-full md:w-64"
      style="transition: all 0.15s ease 0s;"
      @focus="onFocusText"
    />
  </div>
</template>

<script>
import { computed, nextTick, ref } from "vue";
export default {
  props: {
    id: String,
    label: String,
    fieldName: String,
    value: [String, Number],
    negatable: {
      type: Boolean,
      default: false,
    },
    keyUp: {
      type: Object,
      required: false,
    },
  },

  setup(props, { emit }) {
    const numberInput = ref(null);
    const visible = ref(false);

    function onBlurNumber() {
      visible.value = false;
    }

    function onFocusText() {
      visible.value = true;
      nextTick(() => numberInput.value.focus());
    }

    function thousandSeprator(number) {
      if (number !== "" || number !== undefined || number !== 0 || number !== "0" || number !== null || isFinite(number)) {
        return Number(number).toLocaleString();
      } else {
        return 0;
      }
    }

    function numberEval(number, negatable) {
      if (number < 0 && !negatable) return 0;
      if (/^[0][0-9]/.test(number)) return number.slice(1, number.length);
      if (number === "" && !negatable) return 0;
      if (!isFinite(number) || number === undefined || number === null) return 0;
      if (number.length > 15) return number.slice(0, 15);
      return number;
    }

    function refresh(value) {
      let tmp = numberEval(value, props.negatable);
      emit("update", { value: tmp, field: props.fieldName });
    }

    const stringValue = computed(() => thousandSeprator(props.value));

    return { stringValue, visible, onBlurNumber, onFocusText, numberInput, refresh };
  },
};
</script>
