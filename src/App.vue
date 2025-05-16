<template>
  <SketchViewer />
  <!-- <CapoeiraViewer /> -->
</template>

<script setup>
import CapoeiraViewer from './components/CapoeiraViewer.vue';
import SketchViewer from './components/SketchViewer.vue';
</script>

<style>
/* Global styles if any */
body, html {
  margin: 0;
  padding: 0;
  overflow: hidden; /* If you want the canvas to take full screen */
}
</style>