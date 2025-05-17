<!-- src/components/ChatbotPage.vue -->
<template>
  <div class="chat-page">
    <NavigationBar
      :isLoggedIn="true"
      :userProfile="'https://images.pexels.com/photos/11273201/pexels-photo-11273201.jpeg?auto=compress&cs=tinysrgb&w=600'"
    />

    <div class="main-content">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <span class="logo-icon">P</span>
            <span class="logo-text">PhysicsVoice</span>
          </div>
          <button class="new-session-btn" @click="startNewSession">
            New Physics Session
          </button>
        </div>

        <div class="recent-sessions">
          <h3>Physics Study Plan</h3>
          <div class="study-weeks">
            <div class="week-header">Week 1: Mechanics Foundations</div>
            <ul class="session-list">
              <li 
                v-for="(topic, index) in weekOneTopics" 
                :key="'w1-'+index"
                class="session-item"
                :class="{ active: currentSession.title === topic.title }"
                @click="selectSession(topic)"
              >
                <span class="session-icon">{{ topic.icon }}</span>
                <span class="session-name">{{ topic.title }}</span>
              </li>
            </ul>
            
            <div class="week-header">Week 2: Energy & Momentum</div>
            <ul class="session-list">
              <li 
                v-for="(topic, index) in weekTwoTopics" 
                :key="'w2-'+index"
                class="session-item"
                :class="{ active: currentSession.title === topic.title }"
                @click="selectSession(topic)"
              >
                <span class="session-icon">{{ topic.icon }}</span>
                <span class="session-name">{{ topic.title }}</span>
              </li>
            </ul>
            
            <div class="week-header">Week 3: Waves & Oscillations</div>
            <ul class="session-list">
              <li 
                v-for="(topic, index) in weekThreeTopics" 
                :key="'w3-'+index"
                class="session-item"
                :class="{ active: currentSession.title === topic.title }"
                @click="selectSession(topic)"
              >
                <span class="session-icon">{{ topic.icon }}</span>
                <span class="session-name">{{ topic.title }}</span>
              </li>
            </ul>
            
            <div class="week-header">Week 4: Electromagnetism</div>
            <ul class="session-list">
              <li 
                v-for="(topic, index) in weekFourTopics" 
                :key="'w4-'+index"
                class="session-item"
                :class="{ active: currentSession.title === topic.title }"
                @click="selectSession(topic)"
              >
                <span class="session-icon">{{ topic.icon }}</span>
                <span class="session-name">{{ topic.title }}</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <main class="chat-area">
        <div class="chat-header">
          <div class="chat-title">
            <h2>{{ currentSession.title }}</h2>
            <p class="chat-subtitle">{{ formattedStartTime }}</p>
          </div>
        </div>

        <div class="content-filters">
          <div
            v-for="filter in contentFilters"
            :key="filter.id"
            class="filter-item"
            :class="{ active: activeFilter === filter.id }"
            @click="selectFilter(filter.id)"
          >
            <span class="filter-label">{{ filter.label }}</span>
          </div>
        </div>

        <div class="chat-messages" ref="chatMessages">
          <div v-if="isLoading" class="loading-indicator">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <template v-for="(message, index) in filteredMessages" :key="index">
            <div v-if="message.type === 'ai'" class="message ai-message">
              <div class="message-avatar">AI</div>
              <div class="message-content">
                <template v-if="message.contentType === 'audio'">
                  <div v-if="message.audioUrl" class="audio-container">
                    <h3>Your Audio</h3>
                    <audio controls class="audio-player" ref="audioPlayer">
                      <source :src="message.audioUrl" type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                    <div class="audio-controls">
                      <button
                        @click="downloadAudio(message)"
                        class="download-button"
                      >
                        Download Audio
                      </button>
                    </div>
                  </div>
                </template>
                <template
                  v-else-if="
                    !message.isEquation && message.contentType !== '3d'
                  "
                >
                  <p v-html="formatMessage(message.content)"></p>
                  <div
                    v-if="message.actions && message.actions.length"
                    class="message-actions"
                  >
                    <button
                      v-for="(action, actionIndex) in message.actions"
                      :key="actionIndex"
                      class="action-link"
                    >
                      {{ action }}
                    </button>
                  </div>
                </template>
              </div>
            </div>

            <div v-else class="message user-message">
              <div class="message-content">
                <p>{{ message.content }}</p>
              </div>
              <div class="message-avatar">
                <img
                  src="https://images.pexels.com/photos/11273201/pexels-photo-11273201.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="User"
                  class="avatar-image"
                />
              </div>
            </div>
          </template>
        </div>

        <div class="chat-input-area">
          <div class="input-container">
            <textarea
              placeholder="Ask a question or type / for commands..."
              v-model="userInput"
              @keydown.enter.prevent="sendMessage"
              :disabled="isLoading"
            ></textarea>
            <button class="send-btn" @click="sendMessage" :disabled="isLoading">
              <i class="icon-send"></i>
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import NavigationBar from "../components/NavigationBar.vue";

// Reactive state
const userInput = ref("");
const endPoint = ref("");
const messages = ref([]);
const isLoading = ref(false);
const chatMessages = ref(null);

const router = useRouter();

const currentSession = ref({
  title: "New Learning",
  startTime: new Date(Date.now() - 20 * 60000), // 20 minutes ago
});

const sessions = ref([{ id: 1, title: "New Learning", icon: "P" }]);

const contentFilters = ref([
  { id: "3d", label: "3D Concept", category: "3d" },
  { id: "text", label: "Text", category: "text" },
  { id: "audio", label: "Audio", category: "audio" },
]);

// Physics study plan data
const weekOneTopics = ref([
  { id: 1, title: "Newton's Laws of Motion", icon: "N" },
  { id: 2, title: "Kinematics & Vectors", icon: "K" },
  { id: 3, title: "Free Body Diagrams", icon: "F" },
  { id: 4, title: "Circular Motion", icon: "C" },
  { id: 5, title: "Universal Gravitation", icon: "G" }
]);

const weekTwoTopics = ref([
  { id: 6, title: "Work & Energy", icon: "W" },
  { id: 7, title: "Conservation of Energy", icon: "E" },
  { id: 8, title: "Momentum & Collisions", icon: "M" },
  { id: 9, title: "Center of Mass", icon: "C" },
  { id: 10, title: "Rotational Motion", icon: "R" }
]);

const weekThreeTopics = ref([
  { id: 11, title: "Simple Harmonic Motion", icon: "S" },
  { id: 12, title: "Wave Properties", icon: "W" },
  { id: 13, title: "Sound Waves", icon: "S" },
  { id: 14, title: "Doppler Effect", icon: "D" },
  { id: 15, title: "Standing Waves", icon: "S" }
]);

const weekFourTopics = ref([
  { id: 16, title: "Electric Fields", icon: "E" },
  { id: 17, title: "Gauss's Law", icon: "G" },
  { id: 18, title: "Electric Potential", icon: "V" },
  { id: 19, title: "Magnetic Fields", icon: "B" },
  { id: 20, title: "Electromagnetic Induction", icon: "I" }
]);

const activeFilter = ref("text");

// Computed properties
const formattedStartTime = computed(() => {
  const minutes = Math.floor(
    (Date.now() - currentSession.value.startTime) / 60000
  );
  return `Started ${minutes} minutes ago`;
});

const downloadAudio = (message) => {
  if (!message.audioUrl || !message.audioBlob) {
    console.error("No audio data available for download");
    return;
  }

  const link = document.createElement("a");
  link.href = message.audioUrl;
  link.download = `voice-${Date.now()}.wav`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const createAudioBlobFromBase64 = (base64Audio) => {
  try {
    // Convert base64 to binary data
    const binaryString = window.atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob from binary data
    return new Blob([bytes], { type: "audio/wav" });
  } catch (err) {
    console.error("Audio processing error:", err);
    return null;
  }
};

const filteredMessages = computed(() => {
  if (activeFilter.value === "all") {
    return messages.value;
  }
  return messages.value.filter((message) => {
    if (message.type === "user") return true;

    let contentType = message.contentType || "text";
    if (message.isEquation) contentType = "text";

    return contentType === activeFilter.value;
  });
});

// Watch effects
watch(
  messages,
  () => {
    nextTick(() => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
      }
    });
  },
  { deep: true }
);

// Methods
const formatMessage = (text) => {
  if (typeof text !== "string") return "";
  let formatted = text.replace(/\n/g, "<br>");
  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return formatted;
};

const sendInitialMessage = async () => {
  isLoading.value = true;
  try {
    const initialAIMessage = {
      type: "ai",
      content:
        "Hello! I'm AliTeach. What aspect interests you? (e.g., physics, biology, sports)",
      contentType: "text",
    };
    messages.value.push(initialAIMessage);
  } catch (error) {
    console.error("Error sending initial message:", error);
    messages.value.push({
      type: "ai",
      contentType: "text",
      content:
        "Hello! I'm AliTeach, your AI learning assistant. I'm having trouble connecting. Please try again.",
    });
  } finally {
    isLoading.value = false;
  }
};

const sendMessage = async () => {
  const userMessageContent = userInput.value.trim();
  if (!userMessageContent) return;

  // Add user message first
  messages.value.push({
    type: "user",
    content: userMessageContent,
  });

  // Clear input and show loading
  userInput.value = "";
  isLoading.value = true;

  let response;

  try {
    // Set endpoint based on content type
    switch (activeFilter.value) {
      case "text":
        endPoint.value = "http://47.254.232.85:8000/api/llm_generate/text";
        response = await axios.post(endPoint.value, {
          text: userMessageContent,
        });
        break;
      case "3d":
        endPoint.value =
          "http://47.254.232.85:8000/api/sketchfabqwen/model-info";

        break;
      case "audio":
        endPoint.value = "http://47.254.232.85:8000/api/tts/synthesize-base64";
        response = await axios.post(endPoint.value, {
          text: userMessageContent,
        });
        break;
      default:
        endPoint.value = "http://47.254.232.85:8000/api/llm_generate/text";
        response = await axios.post(endPoint.value, {
          text: userMessageContent,
        });
    }

    const processedResponse = processAIResponse(response);
    if (processedResponse) {
      messages.value.push(processedResponse);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error sending message:", error);
    messages.value.push({
      type: "ai",
      contentType: "text",
      content:
        "I apologize, but I'm having trouble processing your request. Please try again or contact support if the issue persists.",
    });
  } finally {
    isLoading.value = false;
  }
};

const processAIResponse = (response) => {
  if (!response.data || !response.data.response) {
    throw new Error("Invalid response format");
  }

  const { response: aiResponse } = response.data;

  switch (activeFilter.value) {
    case "text":
      if (aiResponse.text) {
        return {
          type: "ai",
          contentType: "text",
          content: aiResponse.text,
        };
      }
      break;

    case "3d":
      if (aiResponse.model) {
        return {
          type: "ai",
          contentType: "3d",
          title: aiResponse.title || "3D Model",
          content: aiResponse.description || "",
          modelName: aiResponse.model.name,
          modelId: aiResponse.model.id,
        };
      }
      break;

    case "audio":
      if (aiResponse.audio_base64) {
        const base64String = aiResponse.audio_base64.trim();
        const audioBase64 = response.data.response.audio_base64;
        const audioBlob = createAudioBlobFromBase64(base64String);
        const audioUrl = URL.createObjectURL(audioBlob);
        return {
          type: "ai",
          contentType: "audio",
          content: aiResponse.text || "Audio response",
          audioUrl: audioUrl,
        };
      }
      break;
  }

  throw new Error(
    `Unsupported content type or invalid response for ${activeFilter.value}`
  );
};

const startNewSession = () => {
  currentSession.value = {
    title: "New Study Session",
    startTime: new Date(),
  };
  messages.value = [];
  activeFilter.value = "all";
  sendInitialMessage();
};

const selectSession = (session) => {
  currentSession.value = {
    title: session.title,
    startTime: new Date(),
  };
  messages.value = [];
  activeFilter.value = "all";
  sendInitialMessageForSession(session.title);
  console.log("Switched to session:", session.title);
};

const sendInitialMessageForSession = (sessionTitle) => {
  isLoading.value = true;
  messages.value.push({
    type: "ai",
    contentType: "text",
    content: `Welcome to your session on ${sessionTitle}! How can I help you get started?`,
  });
  isLoading.value = false;
};

const selectFilter = (filterId) => {
  if (filterId === "3d") {
    router.push("/ChatBotPageVision");
  }
  // if (filterId === "audio") {
  //   router.push("/ChatBotPageAudio")
  // }
  activeFilter.value = filterId;
};

// Initialize
const route = useRoute();
if (route.params.filter) {
  activeFilter.value = route.params.filter;
}
sendInitialMessage();
</script>

<style scoped>
/* Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.chat-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9f9f9;
  color: #333;
}

/* Header Styles */
.header {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0.5rem 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  color: #00a19a;
  font-size: 1.5rem;
  font-weight: bold;
}

.navigation {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #555;
  text-decoration: none;
  font-size: 0.9rem;
}

.nav-link:hover {
  color: #00a19a;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Main Content Styles */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.logo-icon {
  width: 1.5rem;
  height: 1.5rem;
  background-color: #00a19a;
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 0.5rem;
}

.new-session-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #00a19a;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-session-btn:hover {
  background-color: #008f89;
}

.recent-sessions {
  padding: 1rem;
  flex: 1;
}

.recent-sessions h3 {
  font-size: 0.8rem;
  color: #777;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.session-list {
  list-style: none;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.session-item:hover {
  background-color: #f5f5f5;
}

.session-item.active {
  background-color: #e6f7f6;
  color: #00a19a;
}

.session-icon {
  width: 1.5rem;
  height: 1.5rem;
  background-color: #e0e0e0;
  color: #555;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 0.75rem;
  font-size: 0.8rem;
}

.session-item.active .session-icon {
  background-color: #00a19a;
  color: white;
}

.session-name {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info {
  padding: 1rem;
  display: flex;
  align-items: center;
  border-top: 1px solid #f0f0f0;
}

.user-initials {
  width: 2rem;
  height: 2rem;
  background-color: #f0f0f0;
  color: #555;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 0.75rem;
  font-size: 0.8rem;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Chat Area Styles */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.chat-subtitle {
  font-size: 0.8rem;
  color: #777;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: #777;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.content-filters {
  display: flex;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  gap: 1rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-item:hover {
  background-color: #e6f7f6;
}

.filter-item.active {
  background-color: #00a19a;
  color: white;
}

.filter-icon {
  font-size: 0.9rem;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-count {
  font-size: 0.8rem;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  display: flex;
  margin-bottom: 1rem;
}

.message-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: #00a19a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.action-link {
  padding: 0.5rem 1rem;
  border: 1px solid #00a19a;
  border-radius: 4px;
  color: #00a19a;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-link:hover {
  background-color: #00a19a;
  color: white;
}

.message-type {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.concept-3d-placeholder {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 0.5rem;
}

.interact-btn {
  background-color: #00a19a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.interact-btn:hover {
  background-color: #008f89;
}

.audio-message {
  margin-top: 0.5rem;
}

.audio-player {
  width: 100%;
  margin-top: 0.5rem;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.message-avatar img.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%; /* Ensure the image itself is clipped */
}

.chat-input-area {
  padding: 1rem;
  border-top: 1px solid #f0f0f0;
}

.input-container {
  display: flex;
  gap: 1rem;
}

textarea {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  resize: none;
  height: 2.5rem;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.5;
}

textarea:focus {
  outline: none;
  border-color: #00a19a;
}

.send-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background-color: #00a19a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-btn:hover {
  background-color: #008f89;
}

.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.typing-indicator {
  display: flex;
  gap: 0.5rem;
}

.typing-indicator span {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #00a19a;
  border-radius: 50%;
  animation: typing 1s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}


.study-weeks {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.week-header {
  font-size: 0.9rem;
  font-weight: 600;
  color: #00a19a;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
  border-left: 3px solid #00a19a;
}
@keyframes typing {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
