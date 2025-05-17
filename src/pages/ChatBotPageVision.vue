<template>
  <v-row class="pa-2">
    <v-col>
      <div
        class="nav-buttons"
        style="margin-bottom: 16px; display: flex; gap: 10px; justify-content: center; align-items: center;"
      >
        <button @click="goHome" class="nav-btn">Home</button>
        <button @click="goGeneralChat" class="nav-btn">General Chat</button>
      </div>
    </v-col>
  </v-row>
  <!-- Chat interface -->

  <div class="chat-draft-page">
    <!-- Main container -->
    <div class="two-column-layout">
      <!-- Left side: 3D Model Viewer -->
      <div class="model-column">
        <h2 class="section-title">Visual & Kinesthetic</h2>

        <div class="viewer-container" ref="viewerContainer">
          <p v-if="!currentModelId && !isLoading" class="placeholder-text">
            Get started by asking question in the chat!
          </p>
          <p v-if="isLoading" class="loading-text">Loading model...</p>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        </div>

        <div class="model-info" v-if="modelInfo.model_name">
          <h3>{{ modelInfo.model_name }}</h3>
        </div>
      </div>

      <!-- Right side: Chat Interface -->
      <div class="chat-column">
        <h2 class="section-title">Chat Interface</h2>

        <!-- Messages area -->
        <div class="messages-container" ref="messagesContainer">
          <div
            v-for="(msg, index) in messagesList"
            :key="index"
            :class="['message', msg.sender]"
          >
            <span>{{ msg.text }}</span>
          </div>
        </div>

        <!-- Input area -->
        <div class="input-container">
          <input
            type="text"
            v-model="inputText"
            @keyup.enter="sendMessage"
            placeholder="Ask about something (e.g., What is a drone?)"
            :disabled="isSending"
            ref="inputField"
          />
          <button
            @click="sendMessage"
            :disabled="isSending || !inputText.trim()"
          >
            <span v-if="!isSending">Send</span>
            <span v-else class="loading-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// Component state
const isComponentMounted = ref(false);

// Viewer state
const viewerContainer = ref(null);
const currentModelId = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");
let iframe = null;

// Chat state
const messagesContainer = ref(null);
const messagesList = ref([]);
const inputText = ref("");
const inputField = ref(null);
const isSending = ref(false);

// Model information
const modelInfo = ref({
  model_name: "",
  definition: "",
  preview_link: "",
});

// Add message to chat
function addMessage(sender, text) {
  if (!isComponentMounted.value) return;

  messagesList.value.push({ sender, text });

  // Scroll to bottom after DOM update
  nextTick(() => {
    if (messagesContainer.value && isComponentMounted.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

// Extract model ID from URL
function getModelId(url) {
  if (!url) return null;

  try {
    const parts = url.split("/");
    return parts[parts.length - 1];
  } catch (e) {
    console.error("Error extracting model ID:", e);
    return null;
  }
}

// Create or update iframe
function createIframe(modelId) {
  if (!viewerContainer.value || !isComponentMounted.value || !modelId) return;

  try {
    // Remove existing iframe
    if (iframe && viewerContainer.value.contains(iframe)) {
      viewerContainer.value.removeChild(iframe);
      iframe = null;
    }

    isLoading.value = true;
    errorMessage.value = "";

    // Create new iframe with fixed permissions
    const newIframe = document.createElement("iframe");
    newIframe.setAttribute("title", "Sketchfab Viewer");
    newIframe.setAttribute(
      "src",
      `https://sketchfab.com/models/${modelId}/embed`
    );
    newIframe.setAttribute("style", "width: 100%; height: 100%; border: none;");

    // Fix permission policy violations by being explicit about permissions
    newIframe.setAttribute("allow", "autoplay; fullscreen");

    // Don't request permissions that cause violations
    // (removed accelerometer and xr-spatial-tracking)

    newIframe.setAttribute("allowfullscreen", "");

    // Add load event listener
    newIframe.onload = () => {
      isLoading.value = false;
      currentModelId.value = modelId;
    };

    // Append to container
    viewerContainer.value.appendChild(newIframe);
    iframe = newIframe;
  } catch (error) {
    console.error("Error creating iframe:", error);
    isLoading.value = false;
    errorMessage.value = "Error displaying 3D model";
  }
}

// Send message and get response
async function sendMessage() {
  if (!isComponentMounted.value) return;

  const message = inputText.value.trim();
  if (!message) return;

  // Add user message to chat
  addMessage("user", message);

  // Clear input and set loading state
  const userMessage = message; // Save message before clearing input
  inputText.value = "";
  isSending.value = true;

  try {
    // Use the exact URL construction from the working code
    const encodedQuery = encodeURIComponent(userMessage);
    const url = `http://47.254.232.85:8000/api/sketchfabqwen/model-info?query=${encodedQuery}`;

    // Make API request exactly as done in the working code
    const response = await axios.post(
      url,
      "", // empty body
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    // Check if component is still mounted
    if (!isComponentMounted.value) return;

    console.log("API Response:", response.data);

    // Process response
    if (response.data && response.data.response) {
      const data = response.data.response;

      // Update model info
      modelInfo.value = data;

      // Add response to chat
      if (data.definition) {
        addMessage("system", data.definition);
      } else {
        addMessage("system", "I found a model that might be relevant.");
      }

      // Load 3D model if preview link exists
      if (data.preview_link) {
        const modelId = getModelId(data.preview_link);
        if (modelId) {
          createIframe(modelId);
        }
      }
    } else {
      addMessage("system", "Sorry, I could not find relevant information.");
    }
  } catch (error) {
    console.error("API Error:", error);

    if (isComponentMounted.value) {
      addMessage(
        "system",
        "Sorry, I encountered an error processing your request."
      );
    }
  } finally {
    isSending.value = false;
  }
}

// Component lifecycle
onMounted(() => {
  isComponentMounted.value = true;

  // Add welcome message
  addMessage(
    "system",
    "You've stepped into a realm of imagination where ideas take shape and play comes to life. The space is wide open—waiting for your spark. Name anything—from a rocket ship to a dragon—and watch it pop into view for hands-on exploration.So... what are we bringing to life first?"
  );

  // Focus input field
  nextTick(() => {
    if (inputField.value && isComponentMounted.value) {
      inputField.value.focus();
    }
  });
});

onBeforeUnmount(() => {
  // Mark component as unmounted to prevent updates
  isComponentMounted.value = false;

  // Clean up iframe
  if (
    iframe &&
    viewerContainer.value &&
    viewerContainer.value.contains(iframe)
  ) {
    try {
      viewerContainer.value.removeChild(iframe);
    } catch (error) {
      console.error("Error removing iframe:", error);
    }
    iframe = null;
  }
});
const router = useRouter();
function goHome() {
  router.push({ path: "/" });
}
function goGeneralChat() {
  router.push({ path: "/ChatBotPage" });
}
</script>

<style scoped>
.chat-draft-page {
  height: 100vh;
  width: 100%;
  font-family: Arial, sans-serif;
  overflow: hidden;
}

.two-column-layout {
  display: flex;
  height: 100%;
}

.model-column,
.chat-column {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.model-column {
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
}

.chat-column {
  background-color: #ffffff;
}

.section-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5rem;
  border-bottom: 2px solid #1caad9;
  padding-bottom: 10px;
}

.viewer-container {
  flex: 1;
  min-height: 400px;
  background-color: #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.placeholder-text,
.loading-text,
.error-text {
  padding: 20px;
  text-align: center;
}

.loading-text {
  color: #1caad9;
  font-weight: bold;
}

.error-text {
  color: #d32f2f;
  font-weight: bold;
}

.model-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  padding: 12px 15px;
  border-radius: 18px;
  max-width: 80%;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease;
}

.user {
  align-self: flex-end;
  background-color: #1caad9;
  color: white;
}

.system {
  align-self: flex-start;
  background-color: #e9e9eb;
  color: #333;
}

.input-container {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
}

input:focus {
  border-color: #1caad9;
}

button {
  padding: 12px 25px;
  background-color: #1caad9;
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #178ebf;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  min-width: 24px;
}

.loading-dots .dot {
  width: 6px;
  height: 6px;
  background-color: white;
  border-radius: 50%;
  animation: dot-pulse 1.4s infinite ease-in-out;
}

.loading-dots .dot:nth-child(1) {
  animation-delay: 0s;
}

.loading-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-pulse {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
