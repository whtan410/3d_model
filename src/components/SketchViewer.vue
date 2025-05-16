<template>
  <div class="sketchfab-viewer-page">
    <h1>Sketchfab Model Viewer</h1>
    
    <div class="input-group">
      <input
        type="text"
        v-model="modelUrl"
        @keyup.enter="loadModelFromInput"
        placeholder="Enter Sketchfab URL"
        :disabled="isLoading"
      />
      <button @click="loadModelFromInput" :disabled="isLoading">
        {{ isLoading ? 'Loading...' : 'Load Model' }}
      </button>
    </div>
    
    <div class="viewer-container" ref="viewerContainerRef">
      <p v-if="!currentModelUid && !isLoading && !errorMessage" class="message">
        Enter a URL and click "Load Model" to view.
      </p>
      <p v-if="isLoading" class="message">Loading model...</p>
      <p v-if="errorMessage" class="message error-message">{{ errorMessage }}</p>
    </div>
    
    <div class="model-controls">
      <button @click="loadPresetModel('car')">Load Car Model</button>
      <button @click="loadPresetModel('house')">Load House Model</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// State variables
const modelUrl = ref('https://sketchfab.com/3d-models/motorcycle-4-stroke-engine-dba271bdb4964a4e8e4dac99dcc7b0aa');
const currentModelUid = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const viewerContainerRef = ref(null);

// Client and iframe references
let sketchfabClient = null;
let currentIframe = null;

// Preset models
const presetModels = {
  car: 'https://sketchfab.com/3d-models/porsche-911-930-turbo-19975dbc91854d6e8371a94a571a78e5',
  house: 'https://sketchfab.com/3d-models/house-in-the-woods-cc16860397e847ed90bf5dae4a570a94'
};

// Helper to extract UID from Sketchfab URL
const getUidFromUrl = (url) => {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment.length > 0);

    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      const uidMatch = lastSegment.match(/([a-f0-9]{32})$/i) || lastSegment.match(/([a-f0-9]{16,})$/i);
      if (uidMatch && uidMatch[1]) {
        return uidMatch[1];
      }
      if (/^[a-f0-9]{16,32}$/i.test(lastSegment)) {
        return lastSegment;
      }
      if (pathSegments.length >= 2 && /^[a-f0-9]{16,32}$/i.test(pathSegments[pathSegments.length - 2])) {
        if (pathSegments[pathSegments.length-1] === 'embed' || pathSegments[pathSegments.length-1] === 'edit') {
          return pathSegments[pathSegments.length - 2];
        }
      }

      console.warn("Could not extract UID from segment:", lastSegment);
      errorMessage.value = `Could not extract UID from URL: "${lastSegment}"`;
      return null;
    }
    errorMessage.value = "URL path seems invalid";
    return null;
  } catch (e) {
    console.error("Invalid URL:", e);
    errorMessage.value = "Invalid URL format";
    return null;
  }
};

// Initialize the Sketchfab viewer with a UID
const initializeViewer = (uid) => {
  if (!uid) {
    errorMessage.value = "No model UID provided";
    isLoading.value = false;
    return;
  }
  if (!viewerContainerRef.value) {
    errorMessage.value = "Viewer container not found";
    isLoading.value = false;
    return;
  }
  if (typeof Sketchfab === 'undefined') {
    errorMessage.value = "Sketchfab API not loaded. Add it to index.html";
    isLoading.value = false;
    console.error("Sketchfab API not available");
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  currentModelUid.value = null;

  // Clear previous iframe
  if (currentIframe) {
    currentIframe.remove();
    currentIframe = null;
  }
  viewerContainerRef.value.innerHTML = '';

  // Create new iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', `Sketchfab Viewer - ${uid}`);
  iframe.setAttribute('allow', 'autoplay; fullscreen; xr-spatial-tracking');
  iframe.setAttribute('xr-spatial-tracking', 'execution-while-out-of-viewport execution-while-not-rendered webxr');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('mozallowfullscreen', 'true');
  iframe.setAttribute('webkitallowfullscreen', 'true');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = '0';

  viewerContainerRef.value.appendChild(iframe);
  currentIframe = iframe;

  // Initialize Sketchfab client
  sketchfabClient = new Sketchfab(iframe);
  sketchfabClient.init(uid, {
    success: function onSuccess(api) {
      api.start(() => {
        console.log('Viewer started:', uid);
      });
      api.addEventListener('viewerready', function() {
        console.log('Viewer ready:', uid);
        isLoading.value = false;
        currentModelUid.value = uid;
      });
    },
    error: function onError(err) {
      console.error('Viewer error:', err);
      errorMessage.value = `Error loading model (${uid})`;
      isLoading.value = false;
      if (currentIframe) {
        currentIframe.remove();
        currentIframe = null;
      }
    },
    ui_infos: 1,
    ui_controls: 1,
    ui_annotations: 1,
    ui_inspector: 0,
    ui_watermark: 0,
    autostart: 1,
    preload: 1,
  });
};

// Load model from input
const loadModelFromInput = () => {
  const uid = getUidFromUrl(modelUrl.value.trim());
  if (uid) {
    initializeViewer(uid);
  } else {
    isLoading.value = false;
    currentModelUid.value = null;
    if (currentIframe) {
      currentIframe.remove();
      currentIframe = null;
      viewerContainerRef.value.innerHTML = `<p class="message error-message">${errorMessage.value || 'Failed to get UID'}</p>`;
    }
  }
};

// Load preset model
const loadPresetModel = (modelType) => {
  if (presetModels[modelType]) {
    modelUrl.value = presetModels[modelType];
    loadModelFromInput();
  }
};

// Load initial model on mount
onMounted(() => {
  if (modelUrl.value) {
    loadModelFromInput();
  }
});
</script>

<style scoped>
.sketchfab-viewer-page {
  width: 1400px;
  margin: 20px auto;
  padding: 25px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.viewer-container {
  width: 1350px;
  height: 600px;
  margin: 0 auto 20px auto;  /* Centered horizontally with bottom margin */
  border: 1px solid #ddd;
  background-color: #f0f0f0;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-group, .model-controls, h1 {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

input[type="text"] {
  flex-grow: 1;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
}

button {
  padding: 12px 25px;
  background-color: #1caad9;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background-color: #178ebf;
}

.viewer-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  background-color: #f0f0f0;
  border-radius: 5px;
}


.message {
  text-align: center;
  padding: 20px;
  color: #777;
}

.error-message {
  color: #d32f2f;
  font-weight: bold;
}
</style>