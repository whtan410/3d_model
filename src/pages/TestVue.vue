<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-card class="pa-4" elevation="2">
              <v-card-title>Your Message</v-card-title>
              <v-form @submit.prevent="sendMessage">
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="userMessage"
                        :append-icon="'mdi-send'"
                        clear-icon="mdi-close-circle"
                        label="Message"
                        type="text"
                        variant="filled"
                        clearable
                        @click:append="handleAppendClick"
                        @click:append-inner="toggleMarker"
                        @click:clear="clearUserMessage"
                        @click:prepend="changeIcon"
                        rows="3"
                        auto-grow
                        @keydown.enter.exact.prevent="sendMessage"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card-title class="px-4 pt-4 pb-2"
              >Chatbot Conversation</v-card-title
            >
            <div ref="chatLogContainerRef" class="chat-log-container">
              <div
                v-if="!chatMessages.length"
                class="text-center text-grey pa-5"
              >
                No messages yet. Type something to start the chat!
              </div>
              <div
                v-for="chat in chatMessages"
                :key="chat.id"
                class="d-flex flex-column"
              >
                <div
                  :class="[
                    'chat-bubble',
                    chat.sender === 'user' ? 'user-bubble' : 'bot-bubble',
                  ]"
                >
                  <div v-if="chat.isTyping" class="d-flex align-center">
                    <v-progress-circular
                      indeterminate
                      size="20"
                      width="2"
                      color="grey"
                    ></v-progress-circular>
                    <span class="ml-2 typing-text">Bot is typing...</span>
                  </div>
                  <div v-else>
                    {{ chat.text }}
                    <span class="timestamp">
                      {{
                        new Date(chat.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }}
                    </span>
                  </div>
                </div>
                <div
                  v-if="
                    chat.sender === 'bot' &&
                    chat.buttons &&
                    chat.buttons.length > 0 &&
                    !chat.isTyping
                  "
                  class="bot-buttons mt-2 mb-2"
                >
                  <v-btn
                    v-for="(button, index) in chat.buttons"
                    :key="index"
                    density="compact"
                    variant="tonal"
                    color="primary"
                    class="mr-2 mb-2"
                    @click="handleBotButtonClick(button.action, button.text)"
                  >
                    {{ button.text }}
                  </v-btn>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, nextTick, watch } from "vue";

// --- Input field logic ---
const icons = [
  "mdi-emoticon",
  "mdi-emoticon-cool",
  "mdi-emoticon-dead",
  "mdi-emoticon-excited",
  "mdi-emoticon-happy",
  "mdi-emoticon-neutral",
  "mdi-emoticon-sad",
  "mdi-emoticon-tongue",
];
const userMessage = ref("");
const marker = ref(true);
const iconIndex = ref(0);

const currentIcon = computed(() => icons[iconIndex.value]);

function toggleMarker() {
  marker.value = !marker.value;
}

function clearUserMessage() {
  userMessage.value = "";
}

function resetIcon() {
  iconIndex.value = 0;
}

function changeIcon() {
  iconIndex.value = (iconIndex.value + 1) % icons.length;
}

// --- Chat logic ---
const chatMessages = ref([]);
const chatLogContainerRef = ref(null); // Ref for the chat log DOM element

function handleAppendClick() {
  if (userMessage.value) {
    sendMessage();
  } else {
    // Handle microphone click if needed, e.g., voice input
    console.log("Microphone clicked (no message to send)");
  }
}

async function sendMessage() {
  const text = userMessage.value.trim();
  if (!text) return;

  chatMessages.value.push({
    id: Date.now(),
    text: text,
    sender: "user",
    timestamp: new Date().toISOString(),
  });

  const messageSent = text;
  resetIcon();
  clearUserMessage();

  await nextTick(); // Ensure user message is rendered and scroll happens
  scrollToBottom();

  simulateBotResponse(messageSent);
}

function simulateBotResponse(userInput) {
  const typingId = Date.now() + 1;
  chatMessages.value.push({
    id: typingId,
    text: "",
    sender: "bot",
    timestamp: new Date().toISOString(),
    isTyping: true,
  });
  scrollToBottom();

  setTimeout(async () => {
    chatMessages.value = chatMessages.value.filter(
      (msg) => msg.id !== typingId
    );

    let botReplyText = `I received: "${userInput}". How can I assist you further?`;
    let botButtons = [];

    const lowerInput = userInput.toLowerCase();

    if (
      lowerInput.includes("cafe") ||
      lowerInput.includes("nearest") ||
      lowerInput.includes("find")
    ) {
      botReplyText = "Okay, I'm looking for cafes. ";
      if (marker.value) {
        botReplyText += "Using your current location setting. ";
      }
      botReplyText +=
        "Can you confirm if I should proceed with the current settings?";
      botButtons = [
        { text: "Yes, proceed", action: "confirmLocationSearch" },
        { text: "No, change settings", action: "changeLocationSettings" },
      ];
    } else if (
      lowerInput.includes("hello") ||
      lowerInput.includes("hey") ||
      lowerInput.includes("hi")
    ) {
      botReplyText = "Hello there! What can I do for you today?";
    } else if (lowerInput.includes("help")) {
      botReplyText = "Sure, I can help. What do you need assistance with?";
      botButtons = [
        { text: "General Info", action: "generalInfo" },
        { text: "Account Help", action: "accountHelp" },
      ];
    }

    chatMessages.value.push({
      id: Date.now() + 2,
      text: botReplyText,
      sender: "bot",
      timestamp: new Date().toISOString(),
      buttons: botButtons,
      isTyping: false,
    });

    await nextTick();
    scrollToBottom();
  }, 1500 + Math.random() * 1000);
}

async function handleBotButtonClick(action, buttonText) {
  chatMessages.value.push({
    id: Date.now(),
    text: `You clicked: "${buttonText}"`,
    sender: "user",
    timestamp: new Date().toISOString(),
  });
  await nextTick();
  scrollToBottom();

  let botResponseToAction = `Okay, processing: "${buttonText}".`;
  if (action === "confirmLocationSearch") {
    botResponseToAction = "Great! Searching for locations now...";
  } else if (action === "changeLocationSettings") {
    botResponseToAction =
      "Understood. Please tell me the new location or settings.";
  } else if (action === "generalInfo") {
    botResponseToAction = "Here is some general information for you...";
  } else if (action === "accountHelp") {
    botResponseToAction =
      "Let me connect you to account support or provide account help documents.";
  }

  const typingId = Date.now() + 1;
  chatMessages.value.push({
    id: typingId,
    text: "",
    sender: "bot",
    timestamp: new Date().toISOString(),
    isTyping: true,
  });
  scrollToBottom();

  setTimeout(async () => {
    chatMessages.value = chatMessages.value.filter(
      (msg) => msg.id !== typingId
    );
    chatMessages.value.push({
      id: Date.now() + 2,
      text: botResponseToAction,
      sender: "bot",
      timestamp: new Date().toISOString(),
    });
    await nextTick();
    scrollToBottom();
  }, 1000 + Math.random() * 500);
}

function scrollToBottom() {
  nextTick(() => {
    const container = chatLogContainerRef.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
}

// Watch for new messages and scroll to bottom
// Using watch with { deep: true } can be intensive for large arrays.
// It's often better to call scrollToBottom manually after modifications.
// However, for simplicity here, we'll keep it if it works for this scale.
// For better performance, call scrollToBottom at the end of sendMessage, simulateBotResponse, handleBotButtonClick.
// I have added manual calls above. You can remove this watcher if those are sufficient.
watch(chatMessages, scrollToBottom, { deep: true });
</script>

<style scoped>
/* Global page styles are in index.html or a global CSS file */
/* Component-specific styles: */

.chat-log-container {
  height: calc(
    100vh - 280px
  ); /* Adjust based on your layout, title height, padding etc. */
  min-height: 300px; /* Minimum height */
  max-height: 60vh; /* Added max-height to better fit various screens */
  overflow-y: auto;
  padding: 16px; /* Use Vuetify spacing or standard px */
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #ffffff;
  display: flex; /* Added to help manage content flow */
  flex-direction: column; /* Stack messages vertically */
}

.chat-bubble {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  margin-bottom: 8px;
  word-wrap: break-word;
  line-height: 1.4;
}

.user-bubble {
  background-color: #1976d2; /* Vuetify primary blue */
  color: white;
  margin-left: auto; /* Align to right */
  border-bottom-right-radius: 5px;
  align-self: flex-end; /* Align self to the end of the flex container */
}

.bot-bubble {
  background-color: #e0e0e0; /* Light grey for bot */
  color: black;
  margin-right: auto; /* Align to left */
  border-bottom-left-radius: 5px;
  align-self: flex-start; /* Align self to the start of the flex container */
}

.timestamp {
  font-size: 0.75rem;
  color: #757575; /* Grey for bot timestamp */
  display: block;
  margin-top: 4px;
  text-align: right;
}

.user-bubble .timestamp {
  color: #b0bec5; /* Lighter grey for user timestamp on dark background */
}

.bot-buttons {
  align-self: flex-start; /* Ensure buttons also align left like bot bubble */
}

.bot-buttons .v-btn {
  text-transform: none; /* Nicer button text */
  font-size: 0.8rem;
}

.typing-text {
  font-style: italic;
  color: #757575;
}

/* Ensure text field has white background if variant is filled and page bg is not white */
.v-text-field--filled {
  background-color: white;
}
</style>
