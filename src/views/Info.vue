<template>
  <div class="container mx-auto px-4 max-w-4xl">
    <div class="mb-8 px-4 py-6 bg-white rounded shadow-lg break-words">
      <h6 class="text-xl font-normal leading-normal mt-0 mb-6 text-gray-800">
        Current Server Events
      </h6>
      <p v-for="(event, index) in eventArr" :key="index" class="mb-6 leading-loose font-light text-gray-800">
        <label class="font-normal"> {{ event.title }} </label> <br />
        Event period:{{ event.period ? event.period : "Unknown" }} <br />
        <a :href="event.url" class="text-blue-600" target="_blank" rel="noopener noreferrer"> {{ event.url }} </a>
      </p>
      <p v-if="eventArr.length === 0" class="mb-6 leading-loose text-gray-800">No active event.</p>
      <div class="flex justify-end">
        <a
          href="https://forum.gameznetwork.com/forums/black-desert-events.427/"
          class="text-blue-600 text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          More info>>
        </a>
      </div>
    </div>

    <div class="mb-8 px-4 py-6 bg-white rounded shadow-lg break-words">
      <h6 class="text-xl font-normal leading-normal mt-0 mb-6 text-gray-800">
        Patch Logs
      </h6>
      <p v-for="(patch, index) in patchArr" :key="index" class="mb-6 leading-loose font-light text-gray-800">
        <label class="font-normal"> {{ patch.title }} </label> <br />
        <a :href="patch.url" class="text-blue-600" target="_blank" rel="noopener noreferrer"> {{ patch.url }} </a>
      </p>
      <p v-if="patchArr.length === 0" class="mb-6 leading-loose text-gray-800">No patch log.</p>
      <div class="flex justify-end">
        <a href="https://forum.gameznetwork.com/forums/patch-notes.408/" class="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">
          More info>>
        </a>
      </div>
    </div>

    <div class="mb-8 px-4 py-6 bg-white rounded shadow-lg break-words">
      <h6 class="text-xl font-normal leading-normal mt-0 mb-6 text-gray-800">
        Misc Infos
      </h6>
      <p v-for="(info, index) in miscArr" :key="index" class="mb-6 leading-loose font-light text-gray-800">
        <label class="font-normal"> {{ info.title }} </label> <br />
        <a :href="info.url" class="text-blue-600" target="_blank" rel="noopener noreferrer"> {{ info.url }} </a>
      </p>
      <p v-if="miscArr.length === 0" class="mb-6 leading-loose text-gray-800">Empty.</p>
    </div>
  </div>
</template>

<script>
import { ref, onBeforeMount } from "vue";
import miscInfoData from "../database/miscInfo.json";

export default {
  setup() {
    const patchArr = ref([]);
    const eventArr = ref([]);
    const miscArr = ref(miscInfoData);

    onBeforeMount(async () => {
      try {
        var addrArr = ["https://forum.gameznetwork.com/forums/black-desert-events.427/", "https://forum.gameznetwork.com/forums/patch-notes.408/"];
        const response = await fetch("https://small-surf-79d4.zbd-info.workers.dev", {
          method: "POST",
          body: JSON.stringify(addrArr),
        });
        var data = await response.text();
        data = data.replace(/\s+/g, " ");

        patchArr.value = getPatchData(data);
        eventArr.value = getEventData(data);

        var eventPreviewLinks = [];
        eventArr.value.forEach((element) => {
          eventPreviewLinks.push(`${element.url}preview`);
        });

        const previewsResponse = await fetch("https://small-surf-79d4.zbd-info.workers.dev", {
          method: "POST",
          body: JSON.stringify(eventPreviewLinks),
        });
        var previewsData = await previewsResponse.text();
        previewsData = previewsData.replace(/\s+/g, " ");
        var previewsDataArr = previewsData.split("<a class='multicorsproxy'");
        previewsDataArr = previewsDataArr.slice(1);

        var linkPattern = new RegExp("href='(.*?)'");
        var previewPattern = new RegExp(`<blockquote class="previewText">(.*?)</blockquote>`);
        var eventPeriodPattern = new RegExp("Event period:(.*?)<br");
        previewsDataArr.forEach((previewString) => {
          var eventUrl = linkPattern.exec(previewString)[1];
          eventArr.value.forEach((eventObj, index) => {
            if (eventUrl === `${eventObj.url}preview`) {
              let tmp = previewPattern.exec(previewString)[1];
              eventArr.value[index].period = eventPeriodPattern.exec(tmp)[1];
            }
          });
        });
      } catch (err) {
        console.log(err);
      }

      function getUrlData(filteredData) {
        let array = /href="(.*?)"(?:.*?)>(.+)/.exec(filteredData);
        return { url: `https://forum.gameznetwork.com/${array[1]}`, title: array[2] };
      }

      function getPatchData(data) {
        var patchPattern = new RegExp("Patch Notes</span></a> <a (.*?)</a>", "g");
        var patchData = [];

        for (let i = 0; i < 5; i++) {
          patchData.push(getUrlData(patchPattern.exec(data)[1]));
        }
        return patchData;
      }

      function getEventData(data) {
        var eventPattern = new RegExp("Open</span></a> <a (.*?)</a>", "g");
        var eventData = [];
        let tmp;
        while ((tmp = eventPattern.exec(data)) !== null) {
          eventData.push(getUrlData(tmp[1]));
        }
        return eventData;
      }
    });

    return { eventArr, patchArr, miscArr };
  },
};
</script>
