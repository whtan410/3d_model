<template>
  <v-card class="student-feature-card mx-auto" max-width="900" elevation="2" rounded="lg">
    <div class="pa-6 header-background" style="background-color: #2ECC71; color: white;">
      <h2 class="text-h5 font-weight-bold">For Students</h2>
    </div>

    <v-container fluid class="pa-md-6 pa-4">
      <v-row align="center">
        <v-col cols="12" md="6">
          <v-list lines="two" class="transparent-list py-0">
            <v-list-item class="px-0 mb-3">
              <template v-slot:prepend>
                <v-icon color="green-darken-1" class="mr-3" size="28">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium text-body-1">
                Learn at your own pace and get the content you need.
              </v-list-item-title>
            </v-list-item>

            <v-list-item class="px-0 mb-3">
              <template v-slot:prepend>
                <v-icon color="green-darken-1" class="mr-3" size="28">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium text-body-1">
                Make learning fun and engaging with tuitions, quizzes, test & quick notes.
              </v-list-item-title>
            </v-list-item>

            <v-list-item class="px-0 mb-3">
              <template v-slot:prepend>
                <v-icon color="green-darken-1" class="mr-3" size="28">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium text-body-1">
                See how you're doing and identify areas to improve.
              </v-list-item-title>
            </v-list-item>

            <v-list-item class="px-0 mb-4">
              <template v-slot:prepend>
                <v-icon color="green-darken-1" class="mr-3" size="28">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium text-body-1">
                Earn rewards for your hard work.
              </v-list-item-title>
            </v-list-item>
          </v-list>

          <v-btn
            color="#27AE60"
            class="text-none mt-4 explore-button"
            size="large"
            rounded="lg"
            elevation="0"
            block
            @click="explorePandai"
          >
            <span class="button-text mr-2">Explore AliTeach for Students</span>
            <v-icon right>mdi-arrow-right-circle-outline</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="12" md="6" class="d-none d-md-flex align-center justify-center pa-0">
          <v-img
            src="@/assets/students.png"
            alt="Students learning illustration"
            contain
            max-height="350"
            class="rounded-lg"
          ></v-img>
        </v-col>
      </v-row>
    </v-container>

    <v-sheet color="grey-lighten-4" class="pa-4 mt-md-2 rounded-b-lg">
      <v-row align="center" justify="center" class="text-center text-md-left">
        <v-col cols="auto" class="py-2 px-2 px-md-3">
          <span class="font-weight-bold text-subtitle-1" style="color: #2c3e50;">Baseline:</span>
        </v-col>
        <v-col cols="12" sm="auto" class="py-1 py-md-2 px-2 px-md-3 d-flex align-center justify-center">
          <span class="text-body-2" style="color: #34495e;">Personalized Learning</span>
          <v-icon size="small" class="mx-1 d-none d-sm-inline-block" color="grey-darken-1">mdi-chevron-right</v-icon>
        </v-col>
        <v-col cols="12" sm="auto" class="py-1 py-md-2 px-2 px-md-3 d-flex align-center justify-center">
          <span class="text-body-2" style="color: #34495e;">Interactive Content</span>
          <v-icon size="small" class="mx-1 d-none d-sm-inline-block" color="grey-darken-1">mdi-chevron-right</v-icon>
        </v-col>
        <v-col cols="12" sm="auto" class="py-1 py-md-2 px-2 px-md-3 d-flex align-center justify-center">
          <span class="text-body-2" style="color: #34495e;">Trackable Progress</span>
          <v-icon size="small" class="mx-1 d-none d-sm-inline-block" color="grey-darken-1">mdi-chevron-right</v-icon>
        </v-col>
        <v-col cols="12" sm="auto" class="py-1 py-md-2 px-2 px-md-3 d-flex align-center justify-center">
          <span class="text-body-2" style="color: #34495e;">Rewards</span>
        </v-col>
      </v-row>
    </v-sheet>
  </v-card>
</template>

<script setup>
// Using <script setup> for a cleaner component structure (Vue 3.2+)
// No specific reactive properties or methods needed for this static display,
// but you can define them here if interactivity is added.

// Method for the button click
const explorePandai = () => {
  console.log('Explore Pandai for Students button clicked!');
  // Add navigation or other actions here
};
</script>

<style scoped>
/* Scoped styles for the component */
.student-feature-card {
  border: 1px solid #e0e0e0; /* Subtle border */
  overflow: hidden; /* Ensures content respects rounded corners */
}

.header-background {
  /* The green background for the header is set inline for simplicity,
     but could be a CSS variable or a prop for more flexibility. */
}

.transparent-list .v-list-item {
  background-color: transparent !important;
}

.explore-button {
  font-weight: bold;
  letter-spacing: 0.5px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.explore-button:hover {
  background-color: #229954 !important; /* Slightly darker green on hover */
  transform: translateY(-2px);
}

.button-text {
  color: white; /* Ensure text is white */
}

/* Ensure v-icon in button is also white */
.explore-button .v-icon {
  color: white !important;
}

/* Responsive adjustments for the baseline section */
@media (max-width: 599px) { /* Vuetify's 'xs' breakpoint */
  .baseline-item {
    justify-content: center;
    text-align: center;
  }
  .baseline-item .v-icon {
    display: none !important; /* Hide chevrons on extra small screens */
  }
  .v-sheet.pa-4 {
    padding-top: 12px !important;
    padding-bottom: 12px !important;
  }
}
</style>
