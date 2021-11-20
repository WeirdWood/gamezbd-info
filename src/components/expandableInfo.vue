<template>
  <q-list bordered class="cornered">
    <div v-if="data.error" class="q-pa-md">
      <span class="text-negative">
        Could not load data, please try again later.
      </span>
    </div>

    <div v-else-if="data.loading" class="q-pa-md">
      <q-skeleton type="text" v-for="i in 5" :key="i" class="q-pa-md" />
    </div>

    <div v-else-if="!data.array" class="q-pa-md">
      <span> No active event. </span>
    </div>

    <template v-else v-for="(element, index) in data.array" :key="element">
      <q-separator v-if="index !== 0" />
      <q-expansion-item
        :group="groupName"
        :label="element.title"
        :default-opened="index === 0 ? true : false"
        header-class="text-secondary"
      >
        <q-card class="cornered expand-card">
          <q-card-section>
            <span
              v-html="filterSnippet(element['content:encoded'], element.title)"
            >
            </span>
            <a
              :href="element.link"
              class="text-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              See more
            </a>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </template>
  </q-list>
</template>

<script>
export default {
  name: "ExpandableInfo",

  props: {
    data: Object,
    groupName: String,
  },

  setup() {
    function filterSnippet(snippet, title) {
      let result = snippet.replaceAll(title, ""); //trim the title off the snippet
      result = result.replaceAll(`<div class="type">Code:</div>`, ""); //remove an uncessesary element
      result = result.replace(/[\u200B-\u200D\uFEFF]/g, ""); //remove zero width spaces
      result = result.replace(/\n\s*\n/g, "\n"); //remove duplicate line breaks
      result = result.replace(/^\s+|\s+$/g, ""); //remove start and end line breaks
      return result;
    }

    return {
      filterSnippet,
    };
  },
};
</script>
