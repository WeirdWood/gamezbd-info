<template>
  <div class="container">
    <q-page class="q-mx-md q-pt-lg">
        <q-card flat class="col-md col-sm-12 col-xs-12 q-pa-md">
          <q-card-section class="q-pa-none">
            <h5 class="q-ma-none q-pb-md text-weight-regular text-primary">
              Patch Notes
            </h5>
            <expandable-info  :data="patchData" :groupName="`patchGroup`" />
          </q-card-section>
        </q-card>

        <q-card flat class="col-md col-sm-12 col-xs-12 q-mt-md q-pa-md">
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
    let patchData = reactive({
      error: false,
      loading: true,
      array: []
    });
    let eventData = reactive({
      error: false,
      loading: true,
      array: []
    });
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

    function splitResponse(data, splitStr) {
      let firstStart = data.lastIndexOf(splitStr[0]);
      let secondStart = data.lastIndexOf(splitStr[1]);
      var firstData, secondData;
      if (firstStart < secondStart) {
        firstData = data.substring(
          firstStart + splitStr[0].length,
          secondStart
        );
        secondData = data.substring(secondStart + splitStr[1].length);
      } else {
        secondData = data.substring(
          secondStart + splitStr[1].length,
          firstStart
        );
        firstData = data.substring(firstStart + splitStr[0].length);
      }
      return [firstData, secondData];
    }

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

.container {
  max-width: 64rem;
}
</style>
