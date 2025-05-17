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
              <span class="logo-icon">V</span>
              <span class="logo-text">VoiceChat</span>
            </div>
            <button class="new-session-btn" @click="startNewSession">
              New Voice Session
            </button>
          </div>
  
          <div class="recent-sessions">
            <h3>Recent Voice Sessions</h3>
            <ul class="session-list">
              <li
                v-for="session in sessions"
                :key="session.id"
                class="session-item"
                :class="{ active: currentSession.title === session.title }"
                @click="selectSession(session)"
              >
                <span class="session-icon">{{ session.icon }}</span>
                <span class="session-name">{{ session.title }}</span>
              </li>
            </ul>
          </div>
        </aside>
  
        <main class="chat-area">
          <div class="chat-header">
            <div class="chat-title">
              <h2>{{ currentSession.title }}</h2>
              <p class="chat-subtitle">{{ formattedStartTime }}</p>
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
  
            <template v-for="(message, index) in messages" :key="index">
              <div v-if="message.type === 'ai'" class="message ai-message">
                <div class="message-avatar">AI</div>
                <div class="message-content">
                  <div class="message-text">
                    <p>{{ message.content }}</p>
                  </div>
                  <div v-if="message.audioUrl" class="audio-container">
                    <h3>Your Audio</h3>
                    <audio controls class="audio-player" ref="audioPlayer">
                      <source :src="message.audioUrl" type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                    <div class="audio-controls">
                      <button @click="downloadAudio(message)" class="download-button">
                        Download Audio
                      </button>
                    </div>
                  </div>
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
                placeholder="Type text to convert to speech..."
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
  import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
  import { useRoute } from "vue-router";
  import axios from "axios";
  import NavigationBar from "../components/NavigationBar.vue";
  
  // Reactive state
  const userInput = ref("");
  const messages = ref([]);
  const isLoading = ref(false);
  const chatMessages = ref(null);
  const apiBaseUrl = "http://47.254.232.85:8000";
  
  const currentSession = ref({
    title: "Voice Conversation",
    startTime: new Date(Date.now() - 20 * 60000), // 20 minutes ago
  });
  
  const sessions = ref([
    { id: 1, title: "Voice Conversation", icon: "V" },
    { id: 2, title: "Speech Practice", icon: "S" },
    { id: 3, title: "Audio Notes", icon: "A" }
  ]);
  
  // Computed properties
  const formattedStartTime = computed(() => {
    const minutes = Math.floor(
      (Date.now() - currentSession.value.startTime) / 60000
    );
    return `Started ${minutes} minutes ago`;
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
  const sendInitialMessage = async () => {
    isLoading.value = true;
    try {
      const initialAIMessage = {
        type: "ai",
        content: "Hello! I'm your voice assistant. Type any text and I'll convert it to speech for you.",
      };
      messages.value.push(initialAIMessage);
    } catch (error) {
      console.error("Error sending initial message:", error);
      messages.value.push({
        type: "ai",
        content: "Hello! I'm your voice assistant. I'm having trouble connecting. Please try again.",
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
  
    try {
      // Make API request to synthesize speech
      console.log('Sending TTS request for text:', userMessageContent);
      const response = await axios.post(
        `${apiBaseUrl}/api/tts/synthesize-base64`,
        { text: userMessageContent },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('API response received:', response.status);
      
      if (response.data && response.data.response && response.data.response.audio_base64) {
        const audioBase64 = response.data.response.audio_base64;
        const audioBlob = createAudioBlobFromBase64(audioBase64);
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Add AI response with audio
        messages.value.push({
          type: "ai",
          content: "Find your answer here:",
          audioUrl: audioUrl,
          audioBlob: audioBlob
        });
        
        // Auto-play the latest audio
        nextTick(() => {
          const players = document.querySelectorAll('audio.audio-player');
          if (players.length > 0) {
            const lastPlayer = players[players.length - 1];
            lastPlayer.play().catch(e => {
              console.error('Audio playback failed:', e);
            });
          }
        });
      } else {
        throw new Error("Audio data not found in server response");
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      messages.value.push({
        type: "ai",
        content: "I apologize, but I'm having trouble generating the speech. Please try again or contact support if the issue persists.",
      });
    } finally {
      isLoading.value = false;
    }
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
      return new Blob([bytes], { type: 'audio/wav' });
    } catch (err) {
      console.error('Audio processing error:', err);
      return null;
    }
  };
  
  const downloadAudio = (message) => {
    if (!message.audioUrl || !message.audioBlob) {
      console.error('No audio data available for download');
      return;
    }
    
    const link = document.createElement('a');
    link.href = message.audioUrl;
    link.download = `voice-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const startNewSession = () => {
    currentSession.value = {
      title: "New Voice Session",
      startTime: new Date(),
    };
    messages.value = [];
    sendInitialMessage();
  };
  
  const selectSession = (session) => {
    currentSession.value = {
      title: session.title,
      startTime: new Date(),
    };
    messages.value = [];
    messages.value.push({
      type: "ai",
      content: `Welcome to your ${session.title}! How can I help you today?`
    });
  };
  
  // Initialize
  const route = useRoute();
  sendInitialMessage();
  
  // Cleanup on unmount
  onBeforeUnmount(() => {
    messages.value.forEach(message => {
      if (message.audioUrl) {
        URL.revokeObjectURL(message.audioUrl);
      }
    });
  });
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
  
  .message-avatar img.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  
  .user-message {
    flex-direction: row-reverse;
  }
  
  .user-message .message-avatar {
    margin-right: 0;
    margin-left: 1rem;
  }
  
  .audio-container {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }
  
  .audio-container h3 {
    color: #444;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .audio-player {
    width: 100%;
    margin-bottom: 0.75rem;
  }
  
  .audio-controls {
    display: flex;
    justify-content: center;
  }
  
  .download-button {
    padding: 0.5rem 1rem;
    background-color: #34a853;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .download-button:hover {
    background-color: #2a8b44;
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