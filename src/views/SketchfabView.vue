<template>
    <div class="page">
      <h1>3D Model Viewer</h1>
      
      <SketchfabViewer 
        initialUrl="https://sketchfab.com/3d-models/motorcycle-4-stroke-engine-dba271bdb4964a4e8e4dac99dcc7b0aa"
        @model-loaded="onModelLoaded"
        height="500px"
        ref="viewer"
      />
      
      <div class="model-controls">
        <button @click="loadPresetModel('car')">Load Car Model</button>
        <button @click="loadPresetModel('house')">Load House Model</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import SketchViewer from '@/components/SketchViewer.vue';
  
  const viewer = ref(null);
  
  const presetModels = {
    car: 'https://sketchfab.com/3d-models/car-model-url',
    house: 'https://sketchfab.com/3d-models/house-model-url'
  };
  
  const loadPresetModel = (modelType) => {
    viewer.value.loadModel(presetModels[modelType]);
  };
  
  const onModelLoaded = ({ uid }) => {
    console.log(`Model loaded successfully: ${uid}`);
  };
  </script>