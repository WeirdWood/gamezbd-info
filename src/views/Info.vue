<template>
  <div class="container mx-auto px-4 max-w-4xl">
    <div class="mb-8 px-4 py-6 bg-white rounded shadow-lg break-words">
      <h6 class="text-xl font-normal leading-normal mt-0 mb-6 text-gray-800">
        Current Server Events
      </h6>
      <p v-for="(event, index) in eventArr" :key="index" class="mb-8 leading-loose font-light text-gray-800">
        <label class="font-normal">
          <a :href="event.link" class="text-blue-600" target="_blank" rel="noopener noreferrer"> {{ event.title }} </a>
        </label>
        <br />
        <span v-html="filterSnippet(event['content:encodedSnippet'], event.title, 200)"></span>
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
      <p v-for="(patch, index) in patchArr" :key="index" class="mb-8 leading-loose font-light text-gray-800">
        <label class="font-normal">
          <a :href="patch.link" class="text-blue-600" target="_blank" rel="noopener noreferrer"> {{ patch.title }} </a>
        </label>
        <br />
        <span v-html="filterSnippet(patch['content:encodedSnippet'], patch.title, 200)"></span>
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
import Parser from "rss-parser";
import miscInfoData from "../database/miscInfo.json";

export default {
  setup() {
    const patchArr = ref([]);
    const eventArr = ref([]);
    const miscArr = ref(miscInfoData);

    onBeforeMount(async () => {
      try {
        //Using a cors proxy deployed on Cloudflare Worker, sources here https://github.com/fawazahmed0/cloudflare-multi-cors-proxy
        //My proxy is strictly whitelisted to only the main site, use a different one on develepment
        const eventRss = "https://forum.gameznetwork.com/forums/black-desert-events.427/index.rss?prefix_id=89";
        const patchRss = "https://forum.gameznetwork.com/forums/patch-notes.408/index.rss";
        var addrArr = [eventRss, patchRss];
        const response = await fetch(process.env.VUE_APP_CORS_SERVER, {
          method: "POST",
          body: JSON.stringify(addrArr),
        });
        var data = await response.text();

        let eventSplitStr = `<a class='multicorsproxy' href='${eventRss}'>true</a>`;
        let patchSplitStr = `<a class='multicorsproxy' href='${patchRss}'>true</a>`;
        let eventXMLStart = data.lastIndexOf(eventSplitStr);
        let patchXMLStart = data.lastIndexOf(patchSplitStr);
        var eventXML, patchXML;
        if (eventXMLStart < patchXMLStart) {
          eventXML = data.substring(eventXMLStart + eventSplitStr.length, patchXMLStart);
          patchXML = data.substring(patchXMLStart + patchSplitStr.length);
        } else {
          patchXML = data.substring(patchXMLStart + patchSplitStr.length, eventXMLStart);
          eventXML = data.substring(eventXMLStart + eventSplitStr.length);
        }

        const parser = new Parser();

        if (eventXML) {
          let eventData = await parser.parseString(eventXML);
          eventArr.value = eventData.items;
        }

        if (patchXML) {
          let patchData = await parser.parseString(patchXML);
          patchArr.value = patchData.items.slice(0, 5);
        }
      } catch (err) {
        console.log(err);
      }
    });

    function filterSnippet(snippet, title, size) {
      let result = snippet.replaceAll(title, "");
      if (result.length <= size) return result;
      else return result.substr(0, size) + "...";
    }

    return { eventArr, patchArr, miscArr, filterSnippet };
  },
};
</script>
