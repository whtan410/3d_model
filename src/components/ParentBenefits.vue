<template>
  <v-card
    class="for-parents-section rounded-xl pa-md-8 pa-4 ma-4"
    color="#FFF9C4"
    flat
    style="position: relative; overflow: hidden"
  >
    <div class="decorative-blob blob-1"></div>
    <div class="decorative-blob blob-2"></div>

    <v-row align="center">
      <v-col cols="12" md="7" style="z-index: 1">
        <h2 class="text-h4 font-weight-bold mb-6" style="color: #795548">
          For Parents
        </h2>

        <v-list color="transparent" class="mb-8">
          <v-list-item
            v-for="(item, index) in benefits"
            :key="index"
            class="px-0 mb-2"
            density="compact"
          >
            <template v-slot:prepend>
              <v-icon color="success" class="mr-3">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title class="text-body-1" style="color: #5d4037">{{
              item
            }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-btn
          color="#FFB74D"
          class="text-capitalize rounded-pill font-weight-bold px-6 py-3"
          size="large"
          elevation="2"
        >
          Explore Pandai for Parents
          <v-icon right dark class="ml-2">mdi-arrow-right-thin</v-icon>
        </v-btn>
      </v-col>

      <v-col
        cols="12"
        md="5"
        class="d-none d-md-flex justify-center align-center"
        style="z-index: 1; position: relative"
      >
        <img
          src="@/assets/parents.png"
          alt="Parents Illustration"
          style="max-width: 100%; height: auto; max-height: 350px"
        />
      </v-col>
    </v-row>

    <v-sheet
      color="rgba(255, 255, 255, 0.8)"
      class="baseline-features-bar rounded-pill pa-3 mt-8 d-flex align-center justify-space-around flex-wrap"
      style="z-index: 1; position: relative"
    >
      <span class="font-weight-medium mr-2" style="color: #795548"
        >Baseline:</span
      >
      <div
        v-for="(feature, index) in baselineFeatures"
        :key="feature"
        class="d-flex align-center mx-1 my-1"
      >
        <span class="text-body-2 font-weight-medium" style="color: #5d4037">{{
          feature
        }}</span>
        <v-icon
          v-if="index < baselineFeatures.length - 1"
          small
          color="#BDBDBD"
          class="mx-1"
          >mdi-chevron-right</v-icon
        >
      </div>
    </v-sheet>
  </v-card>
</template>

<script>
export default {
  name: "ForParentsSection",
  data() {
    return {
      benefits: [
        "See how your child is doing and identify areas to improve",
        "Help your child stay motivated and achieve their goals.",
        "Keep track of fees and make sure your child is getting the most out of the app.",
        "Get help from the Pandai team when you need it.",
      ],
      baselineFeatures: [
        "Track Progress",
        "Set Targets",
        "Manage Account",
        "Get Support",
      ],
      // Replace with your actual image path or a prop
      parentIllustration:
        "@assets/parents.png",
    };
  },
  // If you want to pass the illustration as a prop:
  // props: {
  //   parentIllustration: {
  //     type: String,
  //     default: 'https://placehold.co/400x350/FFF9C4/795548?text=Illustration'
  //   }
  // }
};
</script>

<style scoped>
.for-parents-section {
  border: 1px solid #ffecb3; /* Light border to complement the background */
}

.decorative-blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(20px); /* Soft blur effect */
  z-index: 0;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background-color: #ffcc80; /* Lighter orange-yellow */
  top: -80px;
  right: -80px;
}

.blob-2 {
  width: 250px;
  height: 250px;
  background-color: #ffe082; /* Slightly different yellow */
  bottom: -100px;
  left: -100px;
}

/* Adjust text color for list items if needed, Vuetify defaults might be too light on this bg */
.v-list-item-title {
  color: #5d4037 !important; /* Darker brown for better readability */
}

.v-icon.mdi-check-circle {
  color: #ffb74d !important; /* Using the button color for checkmarks for consistency */
}

.baseline-features-bar {
  backdrop-filter: blur(5px); /* Glassmorphism effect for the bar */
}

/* Responsive adjustments for baseline features bar */
@media (max-width: 600px) {
  .baseline-features-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  .baseline-features-bar > div {
    margin-bottom: 4px;
  }
  .baseline-features-bar > div:last-child .v-icon {
    display: none; /* Hide trailing chevron on last item when stacked */
  }
}
</style>
