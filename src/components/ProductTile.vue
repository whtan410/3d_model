<template>
  <div class="interactive-card">
    <div class="card-image-section">
      <div class="decorative-circle circle-1"></div>
      <div class="decorative-circle circle-2"></div>
      <img
        :src="getImageUrl(imageSrc)"
        alt="Interactive character"
        class="character-image"
      />
    </div>
    <div class="card-content-section">
      <p class="description">
        Understanding challenging topics with text, picture, and audio
      </p>
      <button class="interact-button">
        Interact
        <span class="arrow-icon">&rarr;</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "InteractiveCard",
  props: {
    imageSrc: {
      type: String,
      default: "@/assets/robot-character.png"
    }
  },
  methods: {
    getImageUrl(path) {
      // Remove the '@/' prefix if present
      const processedPath = path.startsWith('@/') ? path.slice(2) : path;
      return new URL(`../assets/${processedPath.split('assets/')[1]}`, import.meta.url).href;
    }
  }
};
</script>

<style scoped>
.interactive-card {
  background-color: #ffffff; /* White background for the content area */
  border-radius: 20px; /* Rounded corners for the entire card */
  border: 1px solid #e0e0e0; /* Light grey border */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Subtle shadow */
  max-width: 320px; /* Max width of the card */
  overflow: hidden; /* To ensure child elements respect border radius */
  font-family: "Arial", sans-serif; /* Or your preferred font */
  margin: 20px; /* For spacing if you place multiple cards */
}

.card-image-section {
  background-color: #e0f7fa; /* Light cyan background for the image area */
  /* A gradient can also be used if preferred, e.g., from image:
     background: linear-gradient(135deg, #c8f0e8 0%, #a4e6de 100%);
  */
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; /* For positioning decorative circles */
  height: 200px; /* Adjust as needed */
  border-top-left-radius: 20px; /* Match parent */
  border-top-right-radius: 20px; /* Match parent */
}

.character-image {
  max-width: 120px; /* Adjust size of the character image */
  height: auto;
  position: relative; /* To ensure it's above decorative circles */
  z-index: 2;
}

.decorative-circle {
  position: absolute;
  border-radius: 50%;
  background-color: #a7f3d0; /* Light green color for circles */
  opacity: 0.7; /* Slight transparency */
  z-index: 1;
}

.circle-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 15%;
}

.circle-2 {
  width: 130px;
  height: 130px;
  top: 30%;
  right: 5%;
  /* Making the second circle slightly different as per image */
  background-color: #8eedc1;
}

.card-content-section {
  padding: 25px;
  text-align: center;
}

.description {
  font-size: 0.95rem;
  color: #555; /* Medium grey for text */
  line-height: 1.5;
  margin-bottom: 25px;
  min-height: 60px; /* Ensure consistent height for description */
}

.interact-button {
  background-color: #00c2a2; /* Teal color for the button */
  color: white;
  border: none;
  border-radius: 25px; /* Pill shape */
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  display: inline-flex; /* To align text and icon */
  align-items: center;
  justify-content: center;
}

.interact-button:hover {
  background-color: #00a88f; /* Darker teal on hover */
  transform: translateY(-2px); /* Slight lift on hover */
}

.interact-button:active {
  transform: translateY(0); /* Reset lift on click */
}

.arrow-icon {
  margin-left: 10px;
  font-size: 1.2rem; /* Adjust arrow size */
  transition: transform 0.3s ease;
}

.interact-button:hover .arrow-icon {
  transform: translateX(3px); /* Slight arrow movement on hover */
}
</style>
