<template>
  <NavigationBar
    :isLoggedIn="userIsLoggedIn"
    :userProfile="currentUser.profilePicture"
    @login="handleLogin"
    @signup="handleSignup"
    @logout="handleLogout"
  />

  <v-container>
    <v-row>
      <v-col cols="12" md="4" class="pa-0">
        <CapoeiraViewer
          :animation="currentAnimation"
          :stopAnimation="shouldStop"
          :autoPlay="true"
          @animationStarted="handleAnimationStarted"
          @animationStopped="handleAnimationStopped"
          @modelLoaded="modelReady = true"
          @error="handleError"
          ref="viewerRef"
        />
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="pa-3 ma-5" elevation="2">
          <v-card-title class="text-center mb-3"
            >Student Skills Assessment</v-card-title
          >
          <SubjectRadarChart
            :labels="subjectCategories"
            :data-points="studentScores"
            :icons="subjectIcons"
            dataset-label="Level"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Q&A Section -->
    <v-row class="mt-0">
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title class="text-center mb-4">
            {{ currentSubject }} Quiz
            <v-chip class="ml-2" color="primary" size="small">
              Question {{ currentQuestionIndex + 1 }}/{{ questions.length }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <v-progress-linear
              v-model="progress"
              color="primary"
              height="8"
              rounded
              class="mb-4"
            ></v-progress-linear>

            <h3 class="text-h6 mb-4">{{ currentQuestion.question }}</h3>

            <v-radio-group
              v-model="selectedAnswer"
              @change="checkAnswer"
              class="mb-4"
            >
              <v-radio
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                :label="option"
                :value="index"
                :disabled="answered"
                :color="getOptionColor(index)"
              ></v-radio>
            </v-radio-group>

            <!-- <v-expand-transition>
              <div v-if="feedback" :class="feedbackClass" class="pa-3 rounded">
                {{ feedback }}
              </div>
            </v-expand-transition> -->

            <v-row class="mt-4">
              <v-col cols="12" class="d-flex justify-space-between">
                <v-btn
                  :disabled="currentQuestionIndex === 0"
                  @click="previousQuestion"
                  variant="outlined"
                >
                  Previous
                </v-btn>
                <v-btn
                  color="primary"
                  :disabled="!answered"
                  @click="nextQuestion"
                >
                  {{ isLastQuestion ? "Finish" : "Next" }}
                </v-btn>
              </v-col>
            </v-row>

            <v-row v-if="quizCompleted" class="mt-4">
              <v-col cols="12">
                <v-card elevation="3" class="mb-4" color="surface">
                  <v-card-title class="text-h5 font-weight-bold primary--text">
                    Your Learning Style
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12">
                        <h2 class="text-h4 font-weight-bold primary--text text-center mb-2">
                          {{ learningStyleData?.style }}
                        </h2>
                        <v-divider class="my-3"></v-divider>
                        <p class="text-body-1 mt-2">{{ learningStyleData?.justification }}</p>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
                <div class="text-center">
                  <v-btn
                    color="success"
                    @click="goToStudy(defaultChatPage)"
                    size="large"
                  >
                    Let's Study
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="pa-5" align="center" justify="center">
      <v-col v-for="image in images" align="center" justify="center">
        <ProductTile :imageSrc="image" />
      </v-col>
    </v-row>

    <v-row align="center" justify="center">
      <v-col cols="12" align="center" justify="center">
        <StudentBenefits />
      </v-col>
    </v-row>

    <ParentBenefits />
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import SubjectRadarChart from "@/components/SubjectRadarChart.vue";
import CapoeiraViewer from "@/components/CapoeiraViewer.vue";
import NavigationBar from "@/components/NavigationBar.vue";
import ParentBenefits from "@/components/ParentBenefits.vue";
import ProductTile from "@/components/ProductTile.vue";
import StudentBenefits from "@/components/StudentBenefits.vue";

const images = [
  "@/assets/product1.png",
  "@/assets/product2.png",
  "@/assets/product3.png",
];

// Animation control variables
const viewerRef = ref(null);
const currentAnimation = ref("");
const shouldStop = ref(false);
const modelReady = ref(false);
const learningStyleData = ref(null); // Or ref({}) if you prefer an empty object


const userIsLoggedIn = ref(true);

const currentUser = ref({
  name: "Su Hyeon",
  profilePicture: "@/assets/user.png",
});

currentAnimation.value = "Waving";

// Animation control methods
const playAnimation = (animName) => {
  shouldStop.value = false;
  currentAnimation.value = animName;
};

const stopAnimation = () => {
  shouldStop.value = true;
  // Reset after stopping
  setTimeout(() => {
    shouldStop.value = false;
  }, 500);
};

const handleAnimationStarted = (animName) => {
  console.log(`Animation started: ${animName}`);
};

const handleAnimationStopped = (animName) => {
  console.log(`Animation stopped: ${animName}`);
};

const handleError = (error) => {
  console.error("CapoeiraViewer error:", error);
};

// Subject data for radar chart
const subjectCategories = [
  "Physics",
  "Biology",
  "Math",
  "Chemistry",
  "English",
  "Sports",
];

const studentScores = [10, 30, 0, 0, 30, 50]; // Example scores

const subjectIcons = [
  // Example for using Vuetify MDI icons or images
  { mdi: "mdi-radioactive", color: "#2196F3" }, // Physics
  { mdi: "mdi-dna", color: "#4CAF50" }, // Biology
  { mdi: "mdi-calculator-variant", color: "#FFC107" }, // Math
  { mdi: "mdi-beaker-outline", color: "#E91E63" }, // Chemistry
  { mdi: "mdi-book-open-page-variant", color: "#9C27B0" }, // English
  { mdi: "mdi-basketball", color: "#FF9800" }, // Sports
];

// Q&A Related Data
const currentSubject = ref("Physics");
const currentQuestionIndex = ref(0);
const selectedAnswer = ref(null);
const answered = ref(false);
const feedback = ref("");
const feedbackClass = ref("");

const questions = ref([
  {
    question:
      "Your teacher is showing the class how to do a science experiment. How do you understand it best?",
    options: [
      "By watching what the teacher is doing.",
      "By listening carefully to what the teacher says.",
      "By reading the steps on the worksheet.",
      "By trying the experiment yourself.",
    ],
  },
  {
    question: "You need to learn a poem for homework. What do you do?",
    options: [
      "Draw pictures to help remember the parts.",
      "Say it out loud over and over again.",
      "Write it down a few times to help you remember.",
      "Act it out with hand movements or walk around while practicing.",
    ],
  },
  {
    question:
      "When you`re trying to figure out how a new game works, what helps you the most?",
    options: [
      "Looking at pictures or diagrams.",
      "Having someone explain it to you.",
      "Reading the instructions.",
      "Jumping in and trying it out.",
    ],
  },
  {
    question: "Your class is learning about volcanoes. What do you enjoy most?",
    options: [
      "Watching videos or looking at volcano pictures.",
      "Listening to the teacher tell exciting facts.",
      "Reading about volcanoes in a book or online.",
      "Building a volcano model or doing a project.",
    ],
  },
  {
    question:
      "You`re asked to give a short presentation in class. How do you prepare?",
    options: [
      "Make a colorful poster or slideshow.",
      "Practice talking out loud with a friend.",
      "Write down everything you want to say.",
      "Rehearse by moving around and acting it out.",
    ],
  },
  {
    question:
      "You`re learning a new song in music class. What helps you remember it?",
    options: [
      "Watching the teacher`s hand movements or sheet music.",
      "Singing it over and over again.",
      "Reading the lyrics quietly to yourself.",
      "Clapping or tapping the beat while singing.",
    ],
  },
]);

const progress = computed(() => {
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100;
});

const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value];
});

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === questions.value.length - 1;
});

function getOptionColor(index) {
  if (!answered.value) return "primary";
  if (index === currentQuestion.value.correctAnswer) return "success";
  if (index === selectedAnswer.value) return "error";
  return "primary";
}

// Add new state for tracking quiz results
const quizResults = ref({
  subject: currentSubject,
  totalQuestions: questions.value.length,
  answers: [],
  startTime: new Date().toISOString(),
  endTime: null,
  score: 0,
});

const router = useRouter();
const quizCompleted = ref(false);
let defaultChatPage = "chatbotpage";

const goToStudy = (defaultChatPage) => {
  router.push("/" + defaultChatPage);
};

// Modify checkAnswer function to store answer data
function checkAnswer() {
  answered.value = true;
  const isCorrect =
    selectedAnswer.value === currentQuestion.value.correctAnswer;

  // Store answer data
  quizResults.value.answers.push({
    questionIndex: currentQuestionIndex.value,
    question: currentQuestion.value.question,
    selectedAnswer: selectedAnswer.value,
    selectedAnswerText: currentQuestion.value.options[selectedAnswer.value],
    correctAnswer: currentQuestion.value.correctAnswer,
    isCorrect: isCorrect,
    timeStamp: new Date().toISOString(),
  });

  if (isCorrect) {
    feedback.value = `Correct! ${currentQuestion.value.explanation}`;
    feedbackClass.value = "bg-success-lighten-4";
    quizResults.value.score += 1;
  } else {
    feedback.value = `Incorrect. ${currentQuestion.value.explanation}`;
    feedbackClass.value = "bg-error-lighten-4";
  }
}

// Modify nextQuestion function to handle quiz completion
async function nextQuestion() {
  if (isLastQuestion.value) {
    try {
      const userAnswer = {
        one: quizResults.value.answers[0].selectedAnswerText,
        two: quizResults.value.answers[1].selectedAnswerText,
        three: quizResults.value.answers[2].selectedAnswerText,
        four: quizResults.value.answers[3].selectedAnswerText,
        five: quizResults.value.answers[4].selectedAnswerText,
        six: quizResults.value.answers[5].selectedAnswerText,
      };

      // console.log(userAnswer)
      const response = await axios.post("http://47.254.232.85:8000/api/learning-style-determiner/determine-learning-style", userAnswer);
      console.log("Quiz results saved successfully:", response.data);
      
      learningStyleData.value = {
          style: response.data.response.style,
          justification: response.data.response.justification,
      };
      console.log("Learning style data set:", learningStyleData.value);
      
      console.log(response.data.response.style.toLowerCase());

      if (response.data.response.style.toLowerCase() === "reading/writing") {
        defaultChatPage = 'chatbotpage';
      } else if (response.data.response.style.toLowerCase() === "auditory") {
        defaultChatPage = 'chatbotpage';
      } else if (response.data.response.style.toLowerCase() === "kinesthetic") {
        defaultChatPage = 'chatbotpage';
      } else if (response.data.response.style.toLowerCase() === "visual") {
        defaultChatPage = 'chatbotpagevision';
      }

      quizCompleted.value = true;
    } catch (error) {
      console.error("Failed to save quiz results:", error);
    }
    return;
  }

  currentQuestionIndex.value++;
  selectedAnswer.value = null;
  answered.value = false;
  feedback.value = "";
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    selectedAnswer.value = null;
    answered.value = false;
    feedback.value = "";
  }
}
</script>

<style scoped>
.bg-success-lighten-4 {
  background-color: #c8e6c9;
}

.bg-error-lighten-4 {
  background-color: #ffcdd2;
}

/* Add any additional page-specific styling here */
.v-card-title {
  color: #333;
}
</style>
