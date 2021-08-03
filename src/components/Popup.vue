<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" static class="fixed z-10 inset-0 overflow-y-auto" @close="open = false" :open="open">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          >
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="mt-3 text-center sm:mt-0 sm:text-left">
                <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                  Formula explanation
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    For having both premium and enhancing event active, these 2 formulas differ: <br />
                    <b>Additive</b>: failstack value * (100% + 30% + 20%), an example would be 0.5% * (1 + 0.3 + 0.2) = 0.75% <br />
                    <b>Multiplicative</b>: failstack value * (100% + 30%) * 120%, an example would be 0.5% * 1.3 * 1.2 = 0.78% <br />
                    <br />
                    <b>Why does this exist?</b> <br />
                    These 2 formulas for enhancing in this server has both been weirdly confirmed by the server staff, which is just so confusing.
                    <br />
                    Example would be here: <br />
                    <br />
                    For Additive confirmation <br />
                    <img src="../assets/Additive-confirmation.jpg" alt="additive confirmation" width="500" height="100" />
                    <br />
                    For Multiplicative confirmation <br />
                    <img src="../assets/Multiplicative-confirmation.jpg" alt="multiplicative confirmation" width="500" height="100" />
                    <br />
                    <b>So which one should I choose?</b> <br />
                    For now, without concrete evidence of which is the correct formula, you can choose either. <br />
                    In my limited experience with enhancing, I believe <b>Additive</b> is the correct formula, and I recommend using that for your
                    calculation.
                  </p>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring sm:mt-0 sm:w-auto sm:text-sm"
                @click="open = false"
              >
                Close
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { ref } from "vue";
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";

export default {
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
  },
  setup() {
    const open = ref(false);

    return {
      open,
    };
  },
};
</script>
