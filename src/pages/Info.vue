<template>
  <div class="container">
    <q-page class="q-mx-md q-py-lg">
        <q-card flat class="col-md col-sm-12 col-xs-12 q-px-md q-py-lg">
          <q-card-section class="q-pa-none">
            <h5 class="q-ma-none q-pb-md text-weight-regular text-primary">
              GameZ Patch Notes
            </h5>
            <expandable-info  :data="patchData" :groupName="`patchGroup`" />
          </q-card-section>
        </q-card>

        <q-card flat class="col-md col-sm-12 col-xs-12 q-mt-md q-px-md q-py-lg">
          <q-card-section class="q-pa-none">
            <h5 class="q-ma-none q-pb-md text-weight-regular text-primary">
              Active Server Events
            </h5>
            <expandable-info  :data="eventData" :groupName="`eventGroup`" />
          </q-card-section>
        </q-card>
    </q-page>
  </div>
</template>

<script>
import { defineComponent, reactive, onBeforeMount } from "vue";
import useStates from "../modules/states";
import expandableInfo from "../components/expandableInfo.vue";
var parser = require("fast-xml-parser");

const eventRss =
  "https://forum.gameznetwork.com/forums/black-desert-events.427/index.rss?prefix_id=89";
const patchRss =
  "https://forum.gameznetwork.com/forums/patch-notes.408/index.rss";

export default defineComponent({
  name: "Info",

  components: {
    expandableInfo
  },

  setup() {
    const patchData = reactive({
      error: false,
      loading: true,
      array: []
    });
    const eventData = reactive({
      error: false,
      loading: true,
      array: []
    });
    const { splitResponse } = useStates();
    //const miscArr = ref(miscInfoData);

    onBeforeMount(async () => {
      try {
        //My proxy is strictly whitelisted to only the main site, use a different one on develepment, see configured address in quasar.cong.js file
        var addrArr = [eventRss, patchRss];
        const response = await fetch(`${process.env.WORKER_URL}/cors`, {
          method: "POST",
          body: JSON.stringify(addrArr),
        });
        var data = await response.text();

        let eventSplitStr = `<a class='multicorsproxy' href='${eventRss}'>true</a>`;
        let patchSplitStr = `<a class='multicorsproxy' href='${patchRss}'>true</a>`;
        var [eventXML, patchXML] = splitResponse(data, [
          eventSplitStr,
          patchSplitStr,
        ]);
        patchData.loading = eventData.loading = false;

        if (eventXML) {
          let parsed = parser.parse(eventXML);
          eventData.array = parsed.rss.channel.item;
        }

        if (patchXML) {
          let parsed = parser.parse(patchXML);
          patchData.array = parsed.rss.channel.item.slice(0, 5);
        }
      } catch (err) {
        patchData.error = eventData.error = true;
      }
    });

    return { eventData, patchData };
  },
});
</script>

<style lang="scss">
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin: 0;
}
</style>
