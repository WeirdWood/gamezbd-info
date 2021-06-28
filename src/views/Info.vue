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
        <pre v-html="filterSnippet(event['content:encodedSnippet'], event.title, 200)"></pre>
      </p>
      <spinner :isLoading="isLoading" />
      <p v-if="eventArr.length === 0 && !isLoading" class="mb-6 leading-loose text-gray-800">No active event.</p>
      <p v-if="error" class="mb-6 leading-loose text-red-500"> Unable to fetch data, please try again later. </p>
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
        <span v-html="filterSnippet(patch['content:encoded'], patch.title, 200)"></span>
      </p>
      <spinner :isLoading="isLoading" />
      <p v-if="patchArr.length === 0 && !isLoading" class="mb-6 leading-loose text-gray-800">No patch log.</p>
      <p v-if="error" class="mb-6 leading-loose text-red-500"> Unable to fetch data, please try again later. </p>
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
import Spinner from "../components/Spinner.vue";
import miscInfoData from "../database/miscInfo.json";

export default {
  components: {
    Spinner
  },
  setup() {
    const patchArr = ref([]);
    const eventArr = ref([]);
    const miscArr = ref(miscInfoData);
    const isLoading = ref(true);
    const error = ref(false);

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
        var [eventXML, patchXML] = splitResponse(data, [eventSplitStr, patchSplitStr]);
        isLoading.value = false;

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
        error.value = true;
      }
    });

    function filterSnippet(snippet, title, size) {
      let result = snippet.replaceAll(title, ""); //trim the title off the snippet
      result = result.replaceAll(`<div class="type">Code:</div>`, "");  //remove an uncessesary element
      result = result.replace(/[\u200B-\u200D\uFEFF]/g, '');  //remove zero width spaces
      result = result.replace(/\n\s*\n/g, '\n');  //remove duplicate line breaks
      result = result.replace(/^\s+|\s+$/g, '');  //remove start and end line breaks
      if (result.length <= size) return result;
      else return result.substr(0, size) + "...";
    }

    function splitResponse(data, splitStr) {
      let firstStart = data.lastIndexOf(splitStr[0]);
      let secondStart = data.lastIndexOf(splitStr[1]);
      var firstData, secondData;
      if (firstStart < secondStart) {
        firstData = data.substring(firstStart + splitStr[0].length, secondStart);
        secondData = data.substring(secondStart + splitStr[1].length);
      } else {
        secondData = data.substring(secondStart + splitStr[1].length, firstStart);
        firstData = data.substring(firstStart + splitStr[0].length);
      }
      return [firstData, secondData];
    }

    return { eventArr, patchArr, miscArr, isLoading, error, filterSnippet };
  },
};
</script>

<style>
/* purgecss ignore */
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.875rem;
line-height: 1.25rem;
}
/* purgecss end ignore */
</style>